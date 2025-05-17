// components/ui/ImageUploader.tsx

import React, { useState, useRef, useEffect } from "react";
import { ImageUpIcon, Loader2, Link2, Upload } from "lucide-react";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { RevButtons } from "@/components/ui/RevButtons";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";

// Constants
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

// Helper functions
async function fileToDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = document.createElement("img");
    image.crossOrigin = "anonymous";
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });
}

async function getCroppedImg(imageSrc: string, pixelCrop: any): Promise<File> {
  try {
    const image = await createImage(imageSrc);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Failed to get canvas context");

    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    );

    return new Promise((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Canvas toBlob failed"));
            return;
          }
          const file = new File([blob], "cropped-image.jpg", {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(file);
        },
        "image/jpeg",
        0.95
      );
    });
  } catch (error) {
    console.error("Error in getCroppedImg:", error);
    throw error;
  }
}

// Upload function that uses the server action
async function uploadToImgBB(file: File) {
  try {
    const formData = new FormData();
    formData.append("image", file);

    // Call the server action to upload the image
    const response = await fetch("/api/upload-image", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Image upload failed");
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error("Upload error:", error);
    throw error;
  }
}

// Helper to check if a URL is a direct image URL (ends with image extension)
function isDirectImageUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname.toLowerCase();
    return (
      path.endsWith(".jpg") ||
      path.endsWith(".jpeg") ||
      path.endsWith(".png") ||
      path.endsWith(".webp") ||
      path.endsWith(".gif") ||
      path.endsWith(".svg")
    );
  } catch {
    return false;
  }
}

interface ImageUploaderProps {
  id: string;
  initialImage?: string;
  onImageUpdate: (id: string, imageUrl: string | null) => void;
  aspectRatio?: number;
  label?: string;
  placeholder?: string;
  className?: string;
  showUrlInput?: boolean;
  maxZoom?: number;
  minZoom?: number;
  zoomStep?: number;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  id,
  initialImage,
  onImageUpdate,
  aspectRatio = 16 / 9,
  label = "Image",
  placeholder = "Click to add an image",
  className = "",
  showUrlInput = false,
  maxZoom = 3,
  minZoom = 1,
  zoomStep = 0.1,
}) => {
  const [image, setImage] = useState<File | null>(null);
  const [originalImage, setOriginalImage] = useState<string | null>(
    initialImage || null
  );
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoadingUrlImage, setIsLoadingUrlImage] = useState(false);
  const [isReplacingWithUrl, setIsReplacingWithUrl] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("upload");
  const [imageSource, setImageSource] = useState<"upload" | "url">("upload");
  const [urlErrorMessage, setUrlErrorMessage] = useState<string>("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check if initial image exists and set it for cropping if it does
  useEffect(() => {
    if (initialImage && !originalImage && !imageToCrop) {
      setOriginalImage(initialImage);
    }
  }, [initialImage]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = "";

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      alert("Please upload JPEG, PNG, or WebP images only");
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      alert("Please upload images under 5MB");
      return;
    }

    try {
      const imageUrl = URL.createObjectURL(file);
      setImageToCrop(imageUrl);
      setImage(null);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setImageSource("upload");
    } catch (error) {
      alert("Failed to process image. Please try again.");
    }
  };

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropSave = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;
    setIsProcessingImage(true);

    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);

      // If it's from a URL source, we may not need to upload
      if (imageSource === "upload") {
        // Upload the cropped image to ImgBB
        setIsUploading(true);
        const uploadedUrl = await uploadToImgBB(croppedImage);
        setOriginalImage(uploadedUrl);
        onImageUpdate(id, uploadedUrl);
      } else {
        // For URL source, just use the cropped image locally
        const dataUrl = await fileToDataUrl(croppedImage);
        setOriginalImage(dataUrl);

        // Also upload this cropped image from URL
        setIsUploading(true);
        const uploadedUrl = await uploadToImgBB(croppedImage);
        onImageUpdate(id, uploadedUrl);
      }

      setImage(croppedImage);
      setImageToCrop(null);
      setIsReplacingWithUrl(false);
    } catch (error) {
      console.error("Crop or upload error:", error);
      alert("Failed to process image. Please try again.");
    } finally {
      setIsProcessingImage(false);
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setImage(null);
    setOriginalImage(null);
    setImageToCrop(null);
    setImageUrl("");
    setIsReplacingWithUrl(false);
    setUrlErrorMessage("");

    // Update parent component
    onImageUpdate(id, null);
  };

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUrlErrorMessage("");

    if (!imageUrl.trim()) {
      return;
    }

    // Simple URL validation
    try {
      const urlObj = new URL(imageUrl);
      setIsLoadingUrlImage(true);

      // Check if it's a direct image URL
      if (!isDirectImageUrl(imageUrl)) {
        setIsLoadingUrlImage(false);
        setUrlErrorMessage(
          "Please enter a direct image URL (ending with .jpg, .png, etc.)"
        );
        return;
      }

      // Test if the URL is a valid image by creating an image element
      const testImage = document.createElement("img");
      testImage.onload = () => {
        // Image loaded successfully, proceed to cropping
        setImageToCrop(imageUrl);
        setCrop({ x: 0, y: 0 });
        setZoom(1);
        setIsLoadingUrlImage(false);
        setImageSource("url");
      };

      testImage.onerror = () => {
        setIsLoadingUrlImage(false);
        setUrlErrorMessage(
          "The URL is not a valid image. Please check the URL and try again."
        );
      };

      // Attempt to load the image
      testImage.src = imageUrl;
    } catch (error) {
      setIsLoadingUrlImage(false);
      setUrlErrorMessage("Please enter a valid URL");
    }
  };

  return (
    <div className={`mt-2 ${className}`}>
      {label && <Label className="mb-2 block">{label}</Label>}

      {imageToCrop && (
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <Label>Crop Image</Label>
            <RevButtons
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              Replace
            </RevButtons>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_IMAGE_TYPES.join(",")}
              onChange={handleImageChange}
              className="hidden"
            />
          </div>
          <div className="relative h-60 border border-[#3F3F3F] rounded-md">
            <Cropper
              image={imageToCrop}
              crop={crop}
              zoom={zoom}
              aspect={aspectRatio}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onCropComplete={onCropComplete}
              maxZoom={maxZoom}
              minZoom={minZoom}
              zoomSpeed={zoomStep}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs">Zoom</Label>
              <span className="text-xs text-muted-foreground">
                {Math.round(zoom * 100)}%
              </span>
            </div>
            <Slider
              min={minZoom}
              max={maxZoom}
              step={zoomStep}
              value={[zoom]}
              onValueChange={(values) => setZoom(values[0])}
              className="w-full"
            />
          </div>
          <div className="flex gap-2">
            <RevButtons
              size="sm"
              onClick={handleCropSave}
              disabled={isProcessingImage || isUploading}
            >
              {isProcessingImage || isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  {isUploading ? "Uploading..." : "Processing..."}
                </>
              ) : (
                "Save Crop"
              )}
            </RevButtons>
            <RevButtons
              variant="outline"
              size="sm"
              onClick={() => {
                setImageToCrop(null);
                setIsReplacingWithUrl(false);
              }}
            >
              Cancel
            </RevButtons>
          </div>
        </div>
      )}

      {!imageToCrop && originalImage && !isReplacingWithUrl && (
        <div className="space-y-2">
          <div className="relative w-full aspect-video rounded-md overflow-hidden">
            <Image
              src={originalImage}
              alt={label}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <RevButtons
              variant="info"
              size="sm"
              className="flex-1"
              onClick={() => setImageToCrop(originalImage)}
            >
              Recrop Image
            </RevButtons>
            {showUrlInput && (
              <>
                {imageSource === "upload" ? (
                  <RevButtons
                    variant="outline"
                    className="flex-1"
                    size="sm"
                    onClick={() => setIsReplacingWithUrl(true)}
                  >
                    <Link2 className="h-4 w-4 mr-2" />
                    Replace with URL
                  </RevButtons>
                ) : (
                  <RevButtons
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Replace with Upload
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept={ACCEPTED_IMAGE_TYPES.join(",")}
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </RevButtons>
                )}
              </>
            )}
            <RevButtons
              variant="destructive"
              size="sm"
              className="flex-1"
              onClick={handleRemoveImage}
            >
              Remove Image
            </RevButtons>
          </div>
        </div>
      )}

      {!imageToCrop && originalImage && isReplacingWithUrl && (
        <div className="space-y-3">
          <form onSubmit={handleUrlSubmit} className="space-y-2">
            <Label className="text-sm">Replace with URL</Label>
            <div className="flex items-center gap-2">
              <Input
                type="text"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Enter direct image URL (e.g., https://example.com/image.jpg)"
                className="flex-1"
                disabled={isLoadingUrlImage}
              />
              <RevButtons
                type="submit"
                size="sm"
                disabled={!imageUrl.trim() || isLoadingUrlImage}
              >
                {isLoadingUrlImage ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load"
                )}
              </RevButtons>
            </div>
            {urlErrorMessage && (
              <p className="text-xs text-destructive">{urlErrorMessage}</p>
            )}
          </form>
          <div className="flex gap-2">
            <RevButtons
              variant="outline"
              size="sm"
              className="flex-1"
              onClick={() => {
                setIsReplacingWithUrl(false);
                setUrlErrorMessage("");
              }}
            >
              Cancel
            </RevButtons>
          </div>
        </div>
      )}

      {!imageToCrop && !originalImage && (
        <>
          {showUrlInput ? (
            <Tabs
              defaultValue="upload"
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="grid grid-cols-2 mb-2">
                <TabsTrigger value="upload">Upload</TabsTrigger>
                <TabsTrigger value="url">URL</TabsTrigger>
              </TabsList>

              <TabsContent value="upload">
                <div
                  className="border-2 border-dashed border-muted-foreground/30 rounded-md p-3 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <div className="flex flex-col items-center">
                    <ImageUpIcon className="h-5 w-5 mb-1 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {placeholder}
                    </p>
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      JPEG, PNG, WebP (
                      {aspectRatio === 16 / 9
                        ? "16:9"
                        : aspectRatio === 1
                          ? "1:1"
                          : aspectRatio.toFixed(1)}
                      ) ratio
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="url">
                <form onSubmit={handleUrlSubmit} className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Input
                      type="text"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      placeholder="Enter direct image URL (e.g., https://example.com/image.jpg)"
                      className="flex-1"
                      disabled={isLoadingUrlImage}
                    />
                    <RevButtons
                      type="submit"
                      size="sm"
                      disabled={!imageUrl.trim() || isLoadingUrlImage}
                    >
                      {isLoadingUrlImage ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Loading...
                        </>
                      ) : (
                        "Load"
                      )}
                    </RevButtons>
                  </div>
                  {urlErrorMessage && (
                    <p className="text-xs text-destructive">
                      {urlErrorMessage}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground">
                    URL must point directly to an image file (.jpg, .png, etc.)
                  </p>
                </form>
              </TabsContent>
            </Tabs>
          ) : (
            <div
              className="border-2 border-dashed border-muted-foreground/30 rounded-md p-3 text-center hover:border-muted-foreground/50 transition-colors cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_IMAGE_TYPES.join(",")}
                onChange={handleImageChange}
                className="hidden"
              />
              <div className="flex flex-col items-center">
                <ImageUpIcon className="h-5 w-5 mb-1 text-muted-foreground" />
                <p className="text-sm text-muted-foreground">{placeholder}</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  JPEG, PNG, WebP (
                  {aspectRatio === 16 / 9
                    ? "16:9"
                    : aspectRatio === 1
                      ? "1:1"
                      : aspectRatio.toFixed(1)}
                  ) ratio
                </p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
