# Digital Portfolio

A simple static portfolio (HTML, CSS, JavaScript). No install or build step.

## Run in VS Code
1. Open this folder in VS Code (File > Open Folder).
2. Install the **Live Server** extension (Ritwick Dey).
3. Right-click `index.html` > **Open with Live Server**.

## Add your content
**Option A: in the browser**
1. Click **Manage content** at the bottom of the page.
2. Fill in Profile, add Projects and Certificates (with images), upload your Resume (PDF or Word document).
3. Click **Download data.js** and replace the `data.js` file in this folder.
   (Content typed in the browser is only saved in your own browser until you do this.)

**Option B: edit files directly**
- Edit `data.js`.
- Put images in `assets/images/` and `assets/certificates/`, and your resume (PDF or Word document) in `assets/resume/`.
- Reference them by path, e.g. `"assets/images/my-app.png"`.

## Deploy
- **Netlify:** drag this whole folder into https://app.netlify.com/drop
- **GitHub Pages:** push the folder to a repo > Settings > Pages > deploy from `main` / root.
- **VS Code:** Netlify or GitHub extensions/terminal work too (`git push`).
