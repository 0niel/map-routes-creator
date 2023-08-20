import { Dialog } from "@headlessui/react";
import { Button } from "flowbite-react";
import { FileInput, TextInput } from "flowbite-react";
import React, { useEffect, useRef, useState } from "react";
import { MapConfig, MapObject, MapObjectType } from "~/lib/figma-map-config";
import { useMapConfigStore } from "~/lib/stores/map-config-store";

interface MapToolsDialogProps {
  selectedStairsMapObject: MapObject | null;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const StairsSelectDialog: React.FC<MapToolsDialogProps> = ({
  selectedStairsMapObject,
  open,
  setOpen,
}) => {
  const figmaMapConfig = useMapConfigStore();

  const [selectedOtherStairsIds, setSelectedOtherStairsIds] = useState<
    string[]
  >([]);

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      className="fixed left-0 top-0 z-50 flex h-full w-full flex-col items-center justify-center overflow-y-auto"
    >
      <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
        <Dialog.Title className="mb-4 text-lg font-medium text-gray-900">
          Выберите куда ведёт эта лестница
        </Dialog.Title>
        <select
          className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
          multiple
          value={selectedOtherStairsIds}
          onChange={(e) => {
            setSelectedOtherStairsIds(
              Array.from(e.target.selectedOptions, (item) => item.value),
            );
          }}
        >
          {figmaMapConfig.config.objects
            .filter((object) => object.type === MapObjectType.STAIRS)
            .map((object) => (
              <option key={object.id} value={object.id}>
                {object.id}
              </option>
            ))}
        </select>

        <div className="mt-4">
          <button
            onClick={() => {
              setOpen(false);
            }}
            className="focus:ring-blue-30000 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4"
          >
            Ок
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default StairsSelectDialog;
