# Enterprise AI Forensics Backend
import os
import io
import datetime
from flask import Flask, request, jsonify, send_file
from fpdf import FPDF
from PIL import Image, ImageChops, ImageEnhance, ExifTags
import numpy as np

app = Flask(__name__, static_url_path='', static_folder='.')

# Configuration
UPLOAD_FOLDER = './uploads'
MAX_CONTENT_LENGTH = 16 * 1024 * 1024 # 16MB
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

@app.route('/')
def root():
    return app.send_static_file('index.html')

@app.route('/analyze')
def tool():
    return app.send_static_file('analyze.html')

def  get_exif_data(image):
    """
    Extracts deep EXIF data including GPS and Lens info.
    """
    exif_data = {}
    gps_info = {}
    
    if not hasattr(image, 'getexif'):
        return {}, {}
        
    exif = image.getexif()
    if not exif:
        return {}, {}

    for tag_id, value in exif.items():
        tag = ExifTags.TAGS.get(tag_id, tag_id)
        
        # Decode bytes
        if isinstance(value, bytes):
            try:
                value = value.decode()
            except:
                value = str(value)
                
        # GPS Info (Tag 34853)
        if tag == 'GPSInfo':
            from PIL.ExifTags import GPSTAGS
            for t in value:
                sub_tag = GPSTAGS.get(t, t)
                gps_info[sub_tag] = value[t]
        else:
            exif_data[str(tag)] = str(value)

    return exif_data, gps_info

def perform_ela(image_path, quality=90):
    """
    Generates an Error Level Analysis (ELA) image.
    """
    try:
        original = Image.open(image_path).convert('RGB')
        
        # Save as temporary JPG
        temp_path = image_path + '.ela.tmp.jpg'
        original.save(temp_path, 'JPEG', quality=quality)
        
        # Compare
        resaved = Image.open(temp_path)
        ela_image = ImageChops.difference(original, resaved)
        
        # Scale
        extrema = ela_image.getextrema()
        max_diff = max([ex[1] for ex in extrema])
        if max_diff == 0: max_diff = 1
        scale = 255.0 / max_diff
        ela_image = ImageEnhance.Brightness(ela_image).enhance(scale)
        
        os.remove(temp_path)
        return ela_image
    except Exception as e:
        print(f"ELA Error: {e}")
        return None

@app.route('/api/analyze', methods=['POST'])
def analyze_image():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    try:
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        filename = f"{timestamp}_{file.filename}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)

        img = Image.open(filepath)
        width, height = img.size
        format = img.format
        
        # Advanced EXIF
        exif_tags, gps_tags = get_exif_data(img)
        
        # ELA
        ela_img = perform_ela(filepath)
        ela_variance = 0.0
        if ela_img:
            ela_np = np.array(ela_img)
            ela_variance = float(np.var(ela_np))

        return jsonify({
            "status": "success",
            "server_analysis": {
                "format": format,
                "dimensions": [width, height],
                "ela_variance": round(ela_variance, 2),
                "exif_count": len(exif_tags),
                "exif_data": exif_tags,
                "gps_found": len(gps_tags) > 0,
                "message": "Deep analysis complete."
            }
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/report', methods=['POST'])
def generate_report():
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400

    file = request.files['file']
    confidence = request.form.get('confidence', 'N/A')
    verdict = request.form.get('verdict', 'Unknown')
    
    try:
        timestamp = datetime.datetime.now().strftime("%Y%m%d%H%M%S")
        filepath = os.path.join(UPLOAD_FOLDER, f"report_img_{timestamp}.jpg")
        file.save(filepath)
        
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font('Helvetica', 'B', 20)
        pdf.cell(0, 10, 'Enterprise AI Forensics Report', new_x="LMARGIN", new_y="NEXT", align='C')
        pdf.ln(10)
        
        pdf.set_font('Helvetica', '', 12)
        pdf.cell(0, 10, f'File: {file.filename}', new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 10, f'Analysis ID: {timestamp}', new_x="LMARGIN", new_y="NEXT")
        pdf.ln(5)
        
        pdf.image(filepath, w=100, x=55)
        pdf.ln(10)

        pdf.set_font('Helvetica', 'B', 14)
        pdf.cell(0, 10, 'Results', new_x="LMARGIN", new_y="NEXT")
        pdf.set_font('Helvetica', '', 12)
        pdf.cell(0, 10, f'Integrity Score: {confidence}', new_x="LMARGIN", new_y="NEXT")
        pdf.cell(0, 10, f'Verdict: {verdict}', new_x="LMARGIN", new_y="NEXT")
        
        pdf.set_y(-30)
        pdf.set_font('Helvetica', 'I', 8)
        pdf.cell(0, 10, 'Generated by AI Forensics Tool', align='C')

        pdf_out = pdf.output()
        return send_file(
            io.BytesIO(pdf_out),
            as_attachment=True,
            download_name=f"Report_{timestamp}.pdf",
            mimetype='application/pdf'
        )
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
