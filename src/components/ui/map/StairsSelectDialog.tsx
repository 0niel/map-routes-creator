import { Dialog } from "@headlessui/react";
import { Button } from "flowbite-react";
import { FileInput, TextInput } from "flowbite-react";
import React, { useEffect, useRef, useState } from "react";
import { MapConfig, MapObject, MapObjectType } from "~/lib/figma-map-config";
import { StairsRef, useMapConfigStore } from "~/lib/stores/map-config-store";

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

  const mapConfig = useMapConfigStore();
  const mapConfigRef = useRef(mapConfig);

  useEffect(() => {
    mapConfigRef.current = mapConfig;
    console.log("mapConfigRef.current", mapConfigRef.current);
  }, [mapConfig]);

  useEffect(() => {
    if (selectedStairsMapObject) {
      const stairsRefs = mapConfigRef.current.stairsRefs;

      const stairsRef = stairsRefs.find(
        (stairsRef) => stairsRef.fromId === selectedStairsMapObject.id,
      );

      if (stairsRef) {
        setSelectedOtherStairsIds(stairsRef.toIds);
      } else {
        setSelectedOtherStairsIds([]);
      }
    }
  }, [selectedStairsMapObject]);

  const handleOk = () => {
    if (selectedStairsMapObject) {
      const stairsRefs = mapConfigRef.current.stairsRefs;

      const stairsRef = stairsRefs.find(
        (stairsRef) => stairsRef.fromId === selectedStairsMapObject.id,
      );

      if (stairsRef) {
        mapConfigRef.current.setStairsRefs(
          mapConfigRef.current.stairsRefs.map((stairsRef) => {
            if (stairsRef.fromId === selectedStairsMapObject.id) {
              return {
                ...stairsRef,
                toIds: selectedOtherStairsIds,
              };
            }
            return stairsRef;
          }),
        );
      } else {
        mapConfigRef.current.setStairsRefs([
          ...mapConfigRef.current.stairsRefs,
          {
            fromId: selectedStairsMapObject.id,
            toIds: selectedOtherStairsIds,
          } as unknown as StairsRef,
        ]);
      }
    }
    setOpen(false);
  };

  const [filter, setFilter] = useState("");
  const [importData, setImportData] = useState("");

  const handleAdd = (idToAdd: string) => {
    setSelectedOtherStairsIds([...selectedOtherStairsIds, idToAdd]);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (e) => {
        if (!e.target?.result) return;
        setImportData(e.target.result.toString());
      };
      reader.readAsText(file);

      const dataToImport = JSON.parse(importData) as {
        stairsRefs: StairsRef[];
      };

      console.log("dataToImport", dataToImport);

      mapConfigRef.current.setStairsRefs(dataToImport.stairsRefs);
    } catch (error) {
      console.log("Error importing data:", error);
    }
  };

  const handleExport = () => {
    const dataToExport = {
      stairsRefs: mapConfigRef.current.stairsRefs,
    };
    const exportedData = JSON.stringify(dataToExport);

    const element = document.createElement("a");
    const file = new Blob([exportedData], {
      type: "application/json",
    });
    element.href = URL.createObjectURL(file);
    element.download = "stairs.json";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

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

        <input
          type="text"
          className="w-full"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
        {/* Скроллящийся контейне */}
        <div className="mt-4 flex h-96 flex-col space-y-4 overflow-y-auto">
          {figmaMapConfig.config.objects
            .filter((object) => object.type === MapObjectType.STAIRS)
            .filter((object) => object.id !== selectedStairsMapObject?.id)
            .filter((object) => object.id.includes(filter))
            .map((object) => (
              <div key={object.id} className="flex items-center">
                {selectedOtherStairsIds.includes(object.id) ? (
                  <Button
                    onClick={() =>
                      setSelectedOtherStairsIds(
                        selectedOtherStairsIds.filter((id) => id !== object.id),
                      )
                    }
                    className="text-gray-900"
                  >
                    Удалить
                  </Button>
                ) : (
                  <Button
                    onClick={() => handleAdd(object.id)}
                    className="text-gray-900"
                  >
                    Добавить
                  </Button>
                )}
                <div className="ml-4">{object.id}</div>
              </div>
            ))}
        </div>
        <div className="mt-4">
          <FileInput onChange={handleImport} />
          <Button
            onClick={handleExport}
            className="focus:ring-blue-30000 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium hover:bg-blue-800 focus:outline-none focus:ring-4"
          >
            Экспорт
          </Button>
        </div>

        <div className="mt-4">
          <button
            onClick={handleOk}
            className="focus:ring-blue-30000 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium hover:bg-blue-800 focus:outline-none focus:ring-4"
          >
            Ок
          </button>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default StairsSelectDialog;
