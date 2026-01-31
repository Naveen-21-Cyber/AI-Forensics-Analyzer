# Deploying to PythonAnywhere

This guide describes how to deploy the **AI Image Forensics Tool** to [PythonAnywhere](https://www.pythonanywhere.com/).

## Prerequisites
1.  A PythonAnywhere account (free tier is sufficient).
2.  The project files (this folder).

## Step 1: Upload Files
1.  Log in to your PythonAnywhere dashboard.
2.  Go to the **Files** tab.
3.  Create a new directory named `mysite` (or any name you prefer).
4.  Upload the following files and folders into that directory:
    *   `app.py`
    *   `requirements.txt`
    *   `index.html`
    *   `analyze.html`
    *   `css/` (folder)
    *   `js/` (folder)

   > **Tip:** You can zip the project folder locally, upload the zip file, and run `unzip project.zip` in a **Bash Console** on PythonAnywhere to save time.

## Step 2: Install Dependencies
1.  Open a **Bash Console** from your dashboard.
2.  Navigate to your project directory:
    ```bash
    cd mysite
    ```
3.  Create and activate a virtual environment (recommended):
    ```bash
    python3 -m venv myenv
    source myenv/bin/activate
    ```
4.  Install Flask:
    ```bash
    pip install -r requirements.txt
    ```

## Step 3: Configure Web App
1.  Go to the **Web** tab on your dashboard.
2.  Click **Add a new web app**.
3.  Select **Manual configuration** (since we are setting up a custom Flask app structure).
4.  Select **Python 3.10** (or your preferred version).
5.  **Virtualenv**: Enter the path to your virtual environment (e.g., `/home/yourusername/mysite/myenv`) if you created one.

## Step 4: Configure WSGI File
1.  In the **Web** tab, scroll down to the **Code** section.
2.  Click the link to edit the **WSGI configuration file** (e.g., `/var/www/yourusername_pythonanywhere_com_wsgi.py`).
3.  Replace the default content with the following:

    ```python
    import sys
    import os

    # Add your project directory to the sys.path
    project_home = '/home/yourusername/mysite'
    if project_home not in sys.path:
        sys.path = [project_home] + sys.path

    # Import flask app but need to call it "application" for WSGI to work
    from app import app as application
    ```
    *(Replace `yourusername` and `mysite` with your actual username and folder name).*

## Step 5: Reload
1.  Go back to the **Web** tab.
2.  Click the green **Reload** button at the top.
3.  Click the link to your site (e.g., `yourusername.pythonanywhere.com`) to view the deployed tool.

## Troubleshooting
- **Static Files Not Loading?** 
  - Ensure your `app.py` is configured to serve static files correctly: `app = Flask(__name__, static_url_path='', static_folder='.')`.
  - Alternatively, configure **Static Files** mappings in the Web tab:
    - URL: `/static/` -> Path: `/home/yourusername/mysite/static`
    - URL: `/css/` -> Path: `/home/yourusername/mysite/css`
    - URL: `/js/` -> Path: `/home/yourusername/mysite/js`
