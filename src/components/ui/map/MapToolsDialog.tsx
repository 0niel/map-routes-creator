import { Dialog } from "@headlessui/react";
import { Button } from "flowbite-react";
import { FileInput, TextInput } from "flowbite-react";
import { dia } from "jointjs";
import React, { useEffect, useRef, useState } from "react";
import { MapConfig } from "~/lib/figma-map-config";
import { useJointCanvasStore } from "~/lib/stores/joint-canvas-store";
import { useMapConfigStore } from "~/lib/stores/map-config-store";

interface MapToolsDialogProps {
  onCreateRoomPoint: () => void;
  exportGraph: () => void;
  drawRoute: (startLabel: string, endLabel: string) => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;

  open: boolean;
  setOpen: (open: boolean) => void;
}

const MapToolsDialog: React.FC<MapToolsDialogProps> = ({
  onCreateRoomPoint,
  exportGraph,
  drawRoute,
  onImport,
  open,
  setOpen,
}) => {
  const [startLabel, setStartLabel] = useState("");
  const [endLabel, setEndLabel] = useState("");

  const figmaMapConfig = useMapConfigStore();
  const jointCanvas = useJointCanvasStore();

  const onFigmaImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result;
      if (!text) return;
      const json = JSON.parse(text as string) as MapConfig;
      figmaMapConfig.setConfig(json);
    };
    reader.readAsText(file);
  };

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
      }}
      className="fixed left-0 top-0 z-50 flex h-full w-full items-center justify-center overflow-y-auto"
    >
      <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
        <div className="flex flex-col space-y-4">
          <button
            type="button"
            onClick={() => {
              onCreateRoomPoint();
            }}
            className="mb-2 mr-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Добавить маршрут
          </button>

          <button
            type="button"
            onClick={() => {
              exportGraph();
            }}
            className="mb-2 mr-2 rounded-lg bg-blue-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Экспорт карты
          </button>

          {/* Ползунок для x и для y который изменяет координаты cells */}
          <div className="flex flex-col">
            <label htmlFor="x">X</label>
            <input
              type="text"
              className="m-2 rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
              onChange={(e) => {
                if (!e.target.value || isNaN(parseInt(e.target.value))) {
                  return;
                }
                jointCanvas.graph.getElements().forEach((cell) => {
                  if (cell.isElement()) {
                    cell.set("position", {
                      x: cell.get("position").x + parseInt(e.target.value),
                      y: cell.get("position").y,
                    });
                  }
                });
                jointCanvas.graph.getLinks().forEach((link) => {
                  const vertices = link.get("vertices");
                  if (!vertices) return;
                  link.set(
                    "vertices",
                    vertices.map((vertex) => {
                      return {
                        x: vertex.x + parseInt(e.target.value),
                        y: vertex.y,
                      };
                    }),
                  );
                });
              }}
            />
            <label htmlFor="y">Y</label>
            <input
              type="text"
              className="m-2 rounded-lg bg-gray-100 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
              onChange={(e) => {
                if (!e.target.value || isNaN(parseInt(e.target.value))) {
                  return;
                }
                jointCanvas.graph.getElements().forEach((cell) => {
                  if (cell.isElement()) {
                    cell.set("position", {
                      x: cell.get("position").x,
                      y: cell.get("position").y + parseInt(e.target.value),
                    });
                  }
                });
                jointCanvas.graph.getLinks().forEach((link) => {
                  const vertices = link.get("vertices");
                  if (!vertices) return;
                  link.set(
                    "vertices",
                    vertices.map((vertex) => {
                      return {
                        x: vertex.x,
                        y: vertex.y + parseInt(e.target.value),
                      };
                    }),
                  );
                });
              }}
            />
          </div>

          {/* Импорт карты */}
          <div className="flex flex-col">
            <label htmlFor="map-import">Импорт карты</label>
            <FileInput
              id="map-import"
              className="m-2 h-10 rounded p-2 text-white"
              onChange={onImport}
            />
          </div>

          {/* Импорт конфига фигмы */}
          <div className="flex flex-col">
            <label htmlFor="figma-import">Импорт конфига фигмы</label>
            <FileInput
              id="figma-import"
              className="m-2 h-10 rounded p-2 text-white"
              onChange={onFigmaImport}
            />
          </div>

          <div className="flex flex-col">
            <label
              htmlFor="floor"
              className="mb-2 block text-sm font-medium text-gray-900"
            >
              Редактируемый этаж
            </label>
            <select
              id="floor"
              className="block w-full rounded-lg border border-gray-300 bg-gray-50 p-2.5 text-sm text-gray-900 focus:border-blue-500 focus:ring-blue-500"
              onChange={(e) => {
                figmaMapConfig.setEditerFloor(parseInt(e.target.value));
              }}
            >
              {Array.from({ length: 8 }, (_, i) => i - 1).map((floor) => (
                <option value={floor} key={floor}>
                  {floor}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-2 flex flex-row items-center justify-between space-x-2">
            <TextInput
              value={startLabel}
              onChange={(e) => setStartLabel(e.target.value)}
            />
            <TextInput
              value={endLabel}
              onChange={(e) => setEndLabel(e.target.value)}
            />

            <button
              type="button"
              onClick={() => {
                drawRoute(startLabel, endLabel);
              }}
              className="rounded-lg bg-blue-700 px-2 py-1 text-sm font-medium text-white hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300"
            >
              Рисовать маршрут
            </button>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
};

export default MapToolsDialog;
