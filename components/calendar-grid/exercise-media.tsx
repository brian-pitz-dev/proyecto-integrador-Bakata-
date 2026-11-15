"use client";

import Image from "next/image";
import { PlayCircle } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { getExerciseMedia } from "@/lib/exercise-media";
import type { Exercise } from "@/lib/gym-exercises";
import { cn } from "@/lib/utils";

/** Las dos fotos superpuestas; la de la posición final aparece y desaparece. */
function Frames({
  photos,
  name,
  size,
  className,
}: {
  photos: [string, string];
  name: string;
  size: number;
  className?: string;
}) {
  return (
    <span className={cn("relative block overflow-hidden bg-white", className)}>
      <Image
        src={photos[0]}
        alt={`${name}: posición inicial`}
        width={size}
        height={Math.round((size * 2) / 3)}
        className="size-full object-cover"
      />
      <Image
        src={photos[1]}
        alt={`${name}: posición final`}
        width={size}
        height={Math.round((size * 2) / 3)}
        className="animate-ejercicio absolute inset-0 size-full object-cover"
      />
    </span>
  );
}

export function VideoLink({ name, className }: { name: string; className?: string }) {
  return (
    <a
      href={getExerciseMedia(name).videoUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline dark:text-[#d6b8f2]",
        className,
      )}
    >
      <PlayCircle className="size-3.5" aria-hidden="true" />
      Ver video
    </a>
  );
}

/** Miniatura animada del ejercicio; al tocarla se ve en grande con el link al video. */
export function ExerciseThumb({ exercise }: { exercise: Exercise }) {
  const { photos } = getExerciseMedia(exercise.name);
  if (!photos) return null;

  return (
    <Dialog>
      <DialogTrigger
        aria-label={`Ver cómo se hace: ${exercise.name}`}
        className="aspect-[3/2] w-24 shrink-0 cursor-zoom-in overflow-hidden rounded-xl ring-1 ring-foreground/10 transition-transform hover:scale-[1.03] focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none sm:w-32"
      >
        <Frames photos={photos} name={exercise.name} size={128} className="size-full" />
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{exercise.name}</DialogTitle>
        </DialogHeader>
        <Frames
          photos={photos}
          name={exercise.name}
          size={480}
          className="aspect-[3/2] w-full rounded-2xl"
        />
        <div className="grid gap-1.5 text-sm">
          <p>
            <span className="font-semibold">{exercise.sets}</span>
            {exercise.muscles && (
              <span className="text-muted-foreground"> · {exercise.muscles}</span>
            )}
          </p>
          <VideoLink name={exercise.name} className="text-sm" />
        </div>
      </DialogContent>
    </Dialog>
  );
}
