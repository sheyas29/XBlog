const cloudinary = require('cloudinary').v2;

function uploadImage(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(options, (error, result) => {
        if (error) return reject(error);
        resolve(result);
      })
      .end(buffer);
  });
}
function uploadAvatar(buffer, userId) {
  return uploadImage(buffer, {
    public_id: `avatars/${userId}`,
    asset_folder: 'avatars',
    overwrite: true,
    invalidate: true, // clears the CDN cache so the new avatar shows up
  });
}
function uploadPostImage(buffer, userId, postId) {
  return uploadImage(buffer, {
    asset_folder: 'posts',
    tags: [`user_${userId}`, `post_${postId}`],
  });
}

module.exports = {
  uploadAvatar,
  uploadPostImage,
};
