import { useState, useRef, useCallback } from 'react';
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Loader2, Crop as CropIcon, Upload, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { API_BASE_URL } from '@/lib/api-config';

interface ImageCropModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export default function ImageCropModal({ isOpen, onClose, onSuccess }: ImageCropModalProps) {
  const [imgSrc, setImgSrc] = useState('');
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [isUploading, setIsUploading] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const aspect = 1; // Square crop for avatar

  const resetState = () => {
    setImgSrc('');
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const onSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return;
      }

      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || ''),
      );
      reader.readAsDataURL(file);
    }
  };

  const onImageLoad = useCallback((e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
  }, [aspect]);

  const getCroppedImg = async (): Promise<Blob | null> => {
    const image = imgRef.current;
    if (!image || !completedCrop) return null;

    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;
    
    // Output size - 256x256 for avatar
    const outputSize = 256;
    canvas.width = outputSize;
    canvas.height = outputSize;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    // Enable smooth scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      outputSize,
      outputSize,
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob),
        'image/jpeg',
        0.9
      );
    });
  };

  const handleUpload = async () => {
    if (!completedCrop) {
      toast.error('Please crop the image first');
      return;
    }

    try {
      setIsUploading(true);
      const croppedBlob = await getCroppedImg();
      
      if (!croppedBlob) {
        toast.error('Failed to process image');
        return;
      }

      const formData = new FormData();
      formData.append('avatar', croppedBlob, 'avatar.jpg');

      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (res.ok) {
        toast.success('Profile photo updated successfully!');
        handleClose();
        onSuccess?.();
      } else {
        const data = await res.json();
        toast.error(data.message || 'Failed to upload photo');
      }
    } catch (err) {
      console.error('Avatar upload error:', err);
      toast.error('Error uploading photo');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-card border border-border rounded-2xl shadow-2xl overflow-hidden w-full max-w-lg mx-auto">
              {/* Header */}
              <div className="bg-gradient-primary p-5 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <CropIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">Update Profile Photo</h2>
                      <p className="text-white/80 text-xs">Select and crop your image</p>
                    </div>
                  </div>
                  <button
                    onClick={handleClose}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-5 space-y-4">
                {!imgSrc ? (
                  // File selection
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-muted-foreground/20 rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={onSelectFile}
                    />
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground/40 mb-4" />
                    <p className="text-sm font-medium text-muted-foreground">
                      Click to select an image
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      JPEG, PNG, GIF, WebP • Max 5MB
                    </p>
                  </div>
                ) : (
                  // Crop area
                  <div className="space-y-4">
                    <div className="bg-muted/30 rounded-xl p-3 flex justify-center items-center min-h-[300px] max-h-[400px] overflow-hidden">
                      <ReactCrop
                        crop={crop}
                        onChange={(_, percentCrop) => setCrop(percentCrop)}
                        onComplete={(c) => setCompletedCrop(c)}
                        aspect={aspect}
                        circularCrop
                        className="max-h-[350px]"
                      >
                        <img
                          ref={imgRef}
                          alt="Crop preview"
                          src={imgSrc}
                          onLoad={onImageLoad}
                          className="max-h-[350px] object-contain"
                        />
                      </ReactCrop>
                    </div>

                    <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                      <CropIcon className="w-3 h-3" />
                      <span>Drag to adjust crop area</span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  {imgSrc && (
                    <Button
                      variant="outline"
                      className="flex-1 rounded-xl"
                      onClick={resetState}
                      disabled={isUploading}
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Choose Different
                    </Button>
                  )}
                  <Button
                    variant="gradient"
                    className="flex-1 rounded-xl"
                    onClick={imgSrc ? handleUpload : () => fileInputRef.current?.click()}
                    disabled={isUploading || (imgSrc && !completedCrop)}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Uploading...
                      </>
                    ) : imgSrc ? (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload Photo
                      </>
                    ) : (
                      'Select Image'
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
