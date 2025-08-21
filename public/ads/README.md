# Local Ads Storage

This folder contains locally stored ad media files as a fallback to Firebase Storage.

## Structure

```
public/ads/
├── videos/     # Video ad files (.mp4, .webm, etc.)
├── images/     # Image ad files (.jpg, .png, .webp, etc.)
└── README.md   # This file
```

## Usage

When an admin uploads ad media:

1. **Primary**: Files are uploaded to Firebase Storage for production use
2. **Fallback**: Files are also saved locally in these folders for development/offline use

## File Naming Convention

Files are saved with the following pattern:
- `{adId}_video.{extension}` for videos
- `{adId}_image.{extension}` for images

Example:
- `ad_12345_video.mp4`
- `ad_12345_image.jpg`

## Implementation Notes

- The `adService.ts` contains `saveFileLocally()` functions for both videos and images
- Local files are referenced as `/ads/videos/{filename}` or `/ads/images/{filename}`
- In production, these local files serve as backup when Firebase Storage is unavailable
- The system automatically falls back to local files if Firebase Storage URLs fail

## Security

- Only admin users can upload files through the admin panel
- File types are validated before upload
- File sizes are limited to prevent abuse
- Malicious file detection should be implemented before production use

## TODO for Production

- [ ] Implement file type validation on server side
- [ ] Add file size limits
- [ ] Implement virus scanning for uploaded files
- [ ] Set up proper CDN for better performance
- [ ] Configure backup/sync between local and Firebase Storage
