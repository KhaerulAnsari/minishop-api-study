const { deleteImages } = require('../middleware/upload');

// Cleanup orphaned files after failed operations
const cleanupOrphanedFiles = (files, operation = 'operation') => {
  if (!files || files.length === 0) return;

  try {
    const filePaths = files.map(file => {
      if (typeof file === 'string') {
        return file; // Already a path
      }
      return `/uploads/products/${file.filename}`; // Multer file object
    });

    deleteImages(filePaths);
    console.log(`🧹 Cleaned up ${filePaths.length} orphaned files after failed ${operation}`);
  } catch (error) {
    console.error(`❌ Error cleaning up orphaned files:`, error);
  }
};

// Schedule cleanup for temp files (in case of unexpected crashes)
const scheduleCleanup = (files, delay = 60000) => { // 1 minute delay
  setTimeout(() => {
    cleanupOrphanedFiles(files, 'scheduled cleanup');
  }, delay);
};

module.exports = {
  cleanupOrphanedFiles,
  scheduleCleanup
};