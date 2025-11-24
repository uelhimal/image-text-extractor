import { X } from "lucide-react";
import { Button } from "./ui/button";

interface ImagePreviewProps {
  imageUrl: string;
  onRemove: () => void;
}

export const ImagePreview = ({ imageUrl, onRemove }: ImagePreviewProps) => {
  return (
    <div className="relative rounded-xl overflow-hidden shadow-medium border border-border">
      <img
        src={imageUrl}
        alt="Uploaded preview"
        className="w-full h-auto max-h-96 object-contain bg-muted"
      />
      <Button
        onClick={onRemove}
        size="icon"
        variant="destructive"
        className="absolute top-4 right-4 shadow-lg"
      >
        <X className="w-4 h-4" />
      </Button>
    </div>
  );
};
