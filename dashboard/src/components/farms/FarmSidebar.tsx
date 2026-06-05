"use client";
import { useState } from "react";
import type { Farm } from "@/types";
import { MapPin, Trash2, Wheat } from "lucide-react";
import clsx from "clsx";

interface Props {
  farms: Farm[];
  selectedId: string | null;
  onSelect: (farm: Farm) => void;
  onDelete: (id: string) => void;
}

export function FarmSidebar({ farms, selectedId, onSelect, onDelete }: Props) {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  if (farms.length === 0) {
    return (
      <p className="text-canopy-500 text-xs text-center py-6">
        No farms registered yet.
      </p>
    );
  }

  return (
    <div className="space-y-1.5">
      {farms.map((farm) => (
        <div
          key={farm.id}
          onClick={() => onSelect(farm)}
          className={clsx(
            "group relative rounded-lg px-3 py-3 cursor-pointer transition-all border",
            selectedId === farm.id
              ? "bg-canopy-700/40 border-canopy-500/40 text-earth-200"
              : "border-transparent hover:bg-canopy-700/20 hover:border-canopy-700/30 text-canopy-300"
          )}
        >
          <div className="flex items-start gap-2.5">
            <Wheat size={14} className={clsx("mt-0.5 flex-shrink-0", selectedId === farm.id ? "text-canopy-300" : "text-canopy-500")} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate leading-tight">{farm.name}</p>
              {(farm.location || farm.cropType) && (
                <p className="text-xs text-canopy-500 mt-0.5 flex items-center gap-1 truncate">
                  {farm.location && <><MapPin size={10} />{farm.location}</>}
                  {farm.cropType && (
                    <span className="text-earth-600">· {farm.cropType}</span>
                  )}
                </p>
              )}
            </div>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(farm.id); }}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:text-red-400 transition-all"
            >
              <Trash2 size={12} />
            </button>
          </div>

          {confirmDelete === farm.id && (
            <div
              className="absolute inset-0 rounded-lg bg-soil-800/95 flex items-center justify-center gap-2 border border-red-900/40 z-10"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="text-xs text-red-300">Delete?</span>
              <button
                onClick={() => { onDelete(farm.id); setConfirmDelete(null); }}
                className="px-2 py-1 text-xs bg-red-600 rounded text-white hover:bg-red-500"
              >Yes</button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-2 py-1 text-xs bg-canopy-700 rounded text-canopy-300 hover:bg-canopy-600"
              >No</button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
