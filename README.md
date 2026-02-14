# 2008 YouTube Portfolio

A nostalgic portfolio website styled like **2008 YouTube** - because who doesn't love that classic interface?

## 🎬 Features

- **Classic YouTube UI** - Red and white logo, gradient buttons, star ratings
- **Video player area** - Your portfolio as the "main video"
- **Command system** - Type commands in the search box!
- **Sidebar projects** - Displayed as "Related Videos"
- **Channel info** - Your profile in the classic channel box
- **YouTube navigation tabs** - Videos, Favorites, Playlists, etc.

## ⚡ Interactive Commands

Type these in the **search box** and press Enter:

```
/languages  - Shows your programming languages
/about      - About you section
/skills     - Your tech stack
/projects   - Your project list
/contact    - Contact information
```

## 🎨 Customization Guide

### 1. Change Your Name & Info

**Your Name** (appears multiple times):
- Line 154: YouTube logo area
- Line 217: Video title
- Line 238: About me description
- Line 298: Channel name
- Line 344+: Related videos author

**Avatar Initials** (line 297):
```html
<div class="channel-avatar">YN</div>
<!-- Change YN to your initials -->
```

### 2. Update About Me Section

Edit the video description (starting line 238):
```html
<p>
    Hi! I'm a passionate full-stack developer with 5+ years...
    [Your bio here]
</p>
```

### 3. Customize Your Tech Stack

**Tags** (line 264):
```html
<a href="#" class="tag">JavaScript</a>
<a href="#" class="tag">YourTech</a>
```

**Tech Stack Sidebar** (line 392):
```html
<strong>Languages:</strong><br>
JavaScript, TypeScript, Python...
[Add your languages]
```

### 4. Add Your Projects

**Related Videos** section (line 310):
```html
<li class="related-video">
    <div class="related-thumb">Project Name</div>
    <div class="related-info">
        <a href="#" class="related-title">Your Project Title</a>
        <div class="related-meta">
            by YourName<br>
            1,234 views<br>
            ★★★★★
        </div>
    </div>
</li>
```

### 5. Update Commands

Edit the commands object in JavaScript (line 434):
```javascript
const commands = {
    '/languages': 'Your languages list',
    '/about': 'Your about text',
    '/skills': 'Your skills',
    '/projects': 'Your projects',
    '/contact': 'Your contact info'
};
```

### 6. Contact Information

**In description** (line 257):
```html
Email: your.email@example.com<br>
GitHub: github.com/yourusername<br>
LinkedIn: linkedin.com/in/yourusername
```

**In commands** (line 439):
```javascript
'/contact': 'Email: your@email.com | GitHub: ... | LinkedIn: ...'
```

## 🎯 2008 YouTube Authentics

This design includes:
- ✅ Classic red/white YouTube logo with "Broadcast Yourself™"
- ✅ Gradient header with Search button
- ✅ Navigation tabs (Videos, Favorites, Playlists...)
- ✅ 4:3 aspect ratio video player
- ✅ Star ratings (★★★★★)
- ✅ Yellow "Subscribe" button
- ✅ Related videos sidebar
- ✅ Classic gray gradients and borders
- ✅ 2008 YouTube footer links
- ✅ View counter and upload date

## 🚀 Deploy to GitHub Pages

1. Create repo: `yourusername.github.io`
2. Upload `index.html`
3. Enable GitHub Pages in Settings
4. Visit: `https://yourusername.github.io`

## 💡 Pro Tips

- The search box is **functional** - type the commands!
- Click the play button for a welcome message
- Change the gradient colors for the avatar and thumbnails to match your brand
- The view counts and star ratings are decorative - update them to reflect real metrics
- Add more "related videos" (projects) - just copy the `<li class="related-video">` block

## 🎨 Color Scheme

Classic 2008 YouTube colors:
- **Red**: `#cc0000` (YouTube red)
- **Yellow**: `#ffcc00` (Subscribe button)
- **Blue**: `#0033cc` (Links)
- **Gradients**: Gray gradients for that classic Web 2.0 look

## 📱 Responsive

The layout adapts to mobile devices, stacking the sidebar below the video on smaller screens.

---

**Nostalgia Level**: Maximum 📼

Built with pure HTML, CSS, and a sprinkle of JavaScript from 2008!
