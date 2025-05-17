// AIInputWithSearch.tsx - Fixed version
"use client";

import { Send, Clock, XCircle, Gavel, ImagePlus } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";

import { cn } from "@/lib/utils";
import { useAutoResizeTextarea } from "@/hooks/use-auto-resize-textarea";
import { RevButtons } from "../../../components/ui/RevButtons";

interface AIInputWithSearchProps {
  id?: string;
  placeholder?: string;
  minHeight?: number;
  maxHeight?: number;
  onSubmit?: (value: string) => void;
  onFileSelect?: (file: File) => void;
  className?: string;
  disabled?: boolean;
  imageFiles?: File[];
  onRemoveImage?: (index: number) => void;
  currentTime?: number;
  isVideoFile?: boolean;
  formatTime?: (time: number) => string;
  maxImages?: number;
  onTimeChange?: (newTime: number) => void;
  showDecisionButton?: boolean;
  onApprove?: () => void;
  onRequestRevisions?: () => void;
  isDecisionPending?: boolean;
  decisionButtonDisabled?: boolean;
  projectTitle?: string;
  roundNumber?: number;
}

export function FeedbackInput({
  id = "feedbackInput",
  placeholder = "Add your feedback...",
  minHeight = 48,
  maxHeight = 164,
  onSubmit,
  onFileSelect,
  className,
  disabled = false,
  imageFiles = [],
  onRemoveImage,
  currentTime = 0,
  isVideoFile = false,
  formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  },
  maxImages = 4,
  onTimeChange,
  showDecisionButton = false,
  onRequestRevisions,
  isDecisionPending = false,
  decisionButtonDisabled = false,
}: AIInputWithSearchProps) {
  const [value, setValue] = useState("");
  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [timeDisplayValue, setTimeDisplayValue] = useState(
    formatTime(currentTime)
  );

  useEffect(() => {
    setTimeDisplayValue(formatTime(currentTime));
  }, [currentTime, formatTime]);
  const handleSubmit = () => {
    if (value.trim() && !disabled) {
      onSubmit?.(value);
      setValue("");
      adjustHeight(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && !disabled) {
      onFileSelect?.(file);
    }
    // Reset file input
    if (e.target) {
      e.target.value = "";
    }
  };

  const canAddMoreImages = imageFiles.length < maxImages;

  return (
    <div
      className={cn(
        "w-full container mx-auto flex justify-center py-4",
        className
      )}
    >
      {/* Images preview */}
      <div className="relative w-full mx-auto">
        {imageFiles.length > 0 && (
          <div className="flex items-center gap-2 mb-2 ">
            {imageFiles.map((file, index) => (
              <div key={index} className="relative w-10 h-10 group">
                <img
                  src={URL.createObjectURL(file)}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover rounded border"
                />
                <button
                  onClick={() => onRemoveImage?.(index)}
                  className="absolute top-0 right-0 h-4 w-4 rounded-full bg-destructive text-destructive-foreground -mt-1 -mr-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  disabled={disabled}
                >
                  <XCircle className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="relative flex flex-col bg-background border-2 border-dashed rounded-2xl">
          <div
            className="overflow-y-auto"
            style={{ maxHeight: `${maxHeight}px` }}
          >
            <Textarea
              id={id}
              value={value}
              placeholder={placeholder}
              className="w-full px-4 py-3 border-none placeholder:text-white/70 resize-none focus-visible:ring-0 leading-[1.2]"
              ref={textareaRef}
              disabled={disabled}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey && !disabled) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
              onChange={(e) => {
                setValue(e.target.value);
                adjustHeight();
              }}
            />
          </div>

          <div className="h-12">
            {/* File and time controls section */}
            <div className="absolute left-3 bottom-3 flex items-center gap-2">
              {/* File upload */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
                disabled={!canAddMoreImages || disabled}
                accept="image/jpeg,image/png,image/webp"
              />

              <RevButtons
                variant="outline"
                disabled={!canAddMoreImages || disabled}
                size="icon"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImagePlus className="w-4 h-4" />
              </RevButtons>

              {/* Time display */}
              {isVideoFile && (
                <RevButtons
                  variant="outline"
                  disabled={disabled}
                  size="sm"
                  asChild
                >
                  <div>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      className={cn(
                        "font-mono text-sm bg-transparent border-none p-0 w-10",
                        "focus:outline-none focus:ring-0",
                        disabled
                          ? "text-muted-foreground cursor-not-allowed"
                          : "text-foreground cursor-text"
                      )}
                      value={timeDisplayValue}
                      onChange={(e) => {
                        if (disabled) return;

                        setTimeDisplayValue(e.target.value);

                        // Parse the time back to seconds
                        const parts = e.target.value.split(":");
                        if (parts.length === 2) {
                          const minutes = parseInt(parts[0]);
                          const seconds = parseInt(parts[1]);
                          if (!isNaN(minutes) && !isNaN(seconds)) {
                            const totalSeconds = minutes * 60 + seconds;
                            onTimeChange?.(totalSeconds);
                          }
                        }
                      }}
                      disabled={disabled}
                      placeholder="00:00"
                      onKeyDown={(e) => {
                        // Allow only numbers and colon
                        if (
                          !/[0-9:]/.test(e.key) &&
                          e.key !== "Backspace" &&
                          e.key !== "Delete"
                        ) {
                          e.preventDefault();
                        }
                      }}
                    />
                  </div>
                </RevButtons>
              )}
            </div>
            <div className="absolute right-3 bottom-3">
              <RevButtons
                size={"icon"}
                onClick={handleSubmit}
                disabled={disabled || !value.trim()}
                variant={
                  value.trim() || imageFiles.length > 0 ? "default" : "outline"
                }
              >
                <Send className="w-4 h-4" />
              </RevButtons>
            </div>
          </div>
        </div>

        {/* Decision button in fixed position */}
        <div className="mt-2 flex items-center justify-between mb-2">
          {/* Left side placeholder or message */}
          {imageFiles.length > 0 ? (
            !canAddMoreImages ? (
              <p className="text-xs text-muted-foreground mt-1 text-center">
                Maximum {maxImages} images reached
              </p>
            ) : (
              <div className="w-[180px]" />
            )
          ) : (
            <div className="w-[180px]" />
          )}

          {/* Right side decision button */}
          {showDecisionButton && (
            <RevButtons
              size="sm"
              variant="yellow"
              onClick={onRequestRevisions}
              disabled={decisionButtonDisabled || isDecisionPending}
            >
              <Gavel className="h-6 w-6" /> Submit Your Decision
            </RevButtons>
          )}
        </div>
      </div>
    </div>
  );
}
