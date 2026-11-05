import { useRef, useState } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { GripVertical, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { Image } from "@/components/ui/image";
import { uploadToLibrary } from "@/lib/media";

export default function GalleryEditor({ label, value = [], onChange, onSetCover, hint }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const upload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setBusy(true);
    setError("");
    try {
      const uploaded = [];
      for (const file of files) {
        uploaded.push(await uploadToLibrary(file));
      }
      onChange([...(value || []), ...uploaded]);
    } catch (err) {
      setError("Some images could not be uploaded. Try smaller files.");
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const onDragEnd = (result) => {
    if (!result.destination || result.destination.index === result.source.index) return;
    const next = [...value];
    const [moved] = next.splice(result.source.index, 1);
    next.splice(result.destination.index, 0, moved);
    onChange(next);
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="caps text-stone">{label}</span>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="inline-flex items-center gap-2 caps text-ink-soft hover:text-ink"
        >
          <ImagePlus size={12} /> Add images
        </button>
      </div>
      <p className="mt-1 text-[11px] text-stone">
        Drag a row to reorder the gallery. The first image also opens the project page.
      </p>

      {value.length === 0 ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-3 flex w-full flex-col items-center justify-center gap-2 border border-dashed border-ink/25 py-8 text-stone hover:border-ink hover:text-ink"
        >
          {busy ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} strokeWidth={1.2} />}
          <span className="caps">{busy ? "Uploading" : "Add gallery images"}</span>
        </button>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="gallery">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps} className="mt-3 space-y-2">
                {value.map((src, index) => (
                  <Draggable key={`${src}-${index}`} draggableId={`${src}-${index}`} index={index}>
                    {(draggable) => (
                      <div
                        ref={draggable.innerRef}
                        {...draggable.draggableProps}
                        className="flex items-center gap-3 border border-ink/12 bg-card p-2"
                      >
                        <span
                          {...draggable.dragHandleProps}
                          className="cursor-grab p-1 text-stone hover:text-ink"
                          aria-label="Reorder image"
                        >
                          <GripVertical size={14} />
                        </span>
                        <div className="h-16 w-24 shrink-0 overflow-hidden bg-sand">
                          <Image src={src} alt={`Gallery ${index + 1}`} className="h-full w-full object-cover" />
                        </div>
                        <span className="caps text-stone">{index + 1}</span>
                        <div className="ml-auto flex items-center gap-1">
                          {onSetCover ? (
                            <button
                              type="button"
                              onClick={() => onSetCover(src)}
                              className="inline-flex items-center gap-1 px-2 py-1 caps text-stone hover:text-ink"
                              title="Use as cover image"
                            >
                              <Star size={12} /> Cover
                            </button>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => onChange(value.filter((_, i) => i !== index))}
                            className="p-2 text-stone hover:text-destructive"
                            aria-label="Remove image"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className="flex w-full items-center justify-center gap-2 border border-dashed border-ink/25 py-3 caps text-stone hover:border-ink hover:text-ink"
                >
                  {busy ? <Loader2 size={13} className="animate-spin" /> : <ImagePlus size={13} />}
                  {busy ? "Uploading" : "Add more"}
                </button>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      {hint ? <p className="mt-2 text-[11px] text-stone">{hint}</p> : null}
      {error ? <p className="mt-2 text-[11px] text-destructive">{error}</p> : null}
      <input ref={inputRef} type="file" accept="image/*" multiple onChange={upload} className="hidden" />
    </div>
  );
}