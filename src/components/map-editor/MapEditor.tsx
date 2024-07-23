import { type dia, shapes } from "jointjs";
import React, { useCallback, useEffect, useMemo, useRef } from "react";

import "jointjs/dist/joint.css";
import "jointjs/css/layout.css";
import "jointjs/css/themes/modern.css";

import { generateGraph } from "~/lib/graph";
import MapRoute, { type MapRouteRef } from "~/components/ui/map/MapRoute";
import MapToolsDialog from "~/components/ui/map/MapToolsDialog";
import {
  type ReactZoomPanPinchRef,
  TransformComponent,
  TransformWrapper,
} from "react-zoom-pan-pinch";
import { getLinkToolsView, createPaper } from "~/lib/joint-utils";
import ScaleButtons from "../ui/map/ScaleButtons";
import { useJointCanvasStore } from "~/lib/stores/joint-canvas-store";
import { useMapConfigStore } from "~/lib/stores/map-config-store";
import MapCanvas from "./MapCanvas";
import StairsSelectDialog from "../ui/map/StairsSelectDialog";
import { MapObject, MapObjectType } from "~/lib/figma-map-config";

export const MouseMode = {
  NONE: "none",
  CREATE_PORT: "create-port",
  SELECT_ELEMETS: "select-elements",
};

const MapEditor = () => {
  const mapConfig = useMapConfigStore();
  const mapConfigRef = useRef(mapConfig);

  const canvasRef = useRef<HTMLDivElement>(null);

  const jointCanvas = useJointCanvasStore();
  const jointCanvasRef = useRef(jointCanvas);

  const [panZoomEnabled, setPanZoomEnabled] = React.useState(false);
  const [scale, setScale] = React.useState(1.0);

  const mapRouteRef = useRef<MapRouteRef>(null);

  const [mouseMode, setMouseMode] = React.useState(MouseMode.NONE);
  const mouseModeRef = useRef(mouseMode);

  useEffect(() => {
    if (mouseMode === MouseMode.CREATE_PORT) {
      document.body.style.cursor = "crosshair";
    } else if (mouseMode === MouseMode.NONE) {
      document.body.style.cursor = "default";
    }

    mouseModeRef.current = mouseMode;
  }, [mouseMode]);

  useEffect(() => {
    mapConfigRef.current = mapConfig;
  }, [mapConfig]);

  useEffect(() => {
    jointCanvasRef.current = jointCanvas;
  }, [jointCanvas]);

  const exportGraph = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const json = jointCanvasRef.current.graph.toJSON();

    // с выбором  в какую папку сохранять
    const file = new File([JSON.stringify(json)], "graph.json", {
      type: "application/json",
    });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = "graph.json";
    a.click();
  };

  const transformComponentRef = useRef<ReactZoomPanPinchRef | null>(null);

  const [toolsDialogOpen, setToolsDialogOpen] = React.useState(false);

  const [map, setMap] = React.useState<string | null>(null);

  type StairsDialogOptions = {
    open: boolean;
    selectedStairsMapObject: MapObject | null;
  };

  const [stairsDialogOptions, setStairsDialogOptions] =
    React.useState<StairsDialogOptions>({
      open: false,
      selectedStairsMapObject: null,
    });

  return (
    <div className="flex h-full flex-col">
      {map !== null && (
        <div>
          <div className="fixed bottom-10 left-10 z-30 flex w-full flex-row justify-between">
            <div className="w-18">
              <ScaleButtons
                onZoomIn={() => transformComponentRef.current?.zoomIn()}
                onZoomOut={() => transformComponentRef.current?.zoomOut()}
              />
            </div>
            <button
              onClick={() => setToolsDialogOpen(true)}
              className="mr-16 h-10 rounded-lg border border-gray-300 bg-gray-50 p-2"
            >
              Открыть инструменты
            </button>
          </div>

          <MapToolsDialog
            open={toolsDialogOpen}
            setOpen={setToolsDialogOpen}
            onImport={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (e) => {
                const text = e.target?.result;
                if (!text) return;
                // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
                const json = JSON.parse(text as string);
                jointCanvas.graph.fromJSON(json);

                // Change graph model attrs
                jointCanvas.graph.getCells().forEach((cell) => {
                  if (cell.isElement()) {
                    cell.set("size", {
                      width: 30,
                      height: 10,
                    });
                  }
                });
              };
              reader.readAsText(file);
            }}
            drawRoute={(startName, endName) => {
              const generated = generateGraph(
                jointCanvasRef.current.graph,
                mapConfigRef.current.stairsRefs,
              );

              console.log(generated);

              mapRouteRef.current?.renderRoute(generated, startName, endName);
            }}
            exportGraph={exportGraph}
            onCreateRoomPoint={() => {
              setMouseMode(MouseMode.CREATE_PORT);
            }}
          />

          <StairsSelectDialog
            open={stairsDialogOptions.open}
            setOpen={(open) =>
              setStairsDialogOptions({ ...stairsDialogOptions, open })
            }
            selectedStairsMapObject={
              stairsDialogOptions.selectedStairsMapObject
            }
          />
          <div className="flex h-full">
            <TransformWrapper
              minScale={0.05}
              initialScale={0.25}
              maxScale={2}
              onTransformed={(e) => {
                if (e.state.scale !== scale) {
                  setScale(e.state.scale);
                }
              }}
              onZoom={(e) => {
                if (e.state.scale !== scale) {
                  setScale(e.state.scale);
                }
              }}
              panning={{ disabled: !panZoomEnabled, velocityDisabled: true }}
              wheel={{ disabled: !panZoomEnabled, step: 0.05 }}
              pinch={{ step: 0.05 }}
              zoomAnimation={{ disabled: true }}
              smooth={true}
              alignmentAnimation={{ disabled: true }}
              velocityAnimation={{ disabled: true, sensitivity: 0 }}
              limitToBounds={false}
              centerZoomedOut={false}
              disablePadding={false}
              doubleClick={{ disabled: true }}
              ref={transformComponentRef}
            >
              <TransformComponent
                wrapperStyle={{
                  width: "100%",
                  height: "100%",
                  position: "absolute",
                }}
              >
                <MapCanvas
                  className="absolute z-30 h-full w-full"
                  mouseMode={mouseMode}
                  setMouseMode={setMouseMode}
                  setPanZoomEnabled={setPanZoomEnabled}
                  onMapObjectDoubleClick={(mapObject) => {
                    if (mapObject.type === MapObjectType.STAIRS) {
                      setStairsDialogOptions({
                        open: true,
                        selectedStairsMapObject: mapObject,
                      });
                    }
                  }}
                />

                <MapRoute ref={mapRouteRef} className="absolute z-20" />

                <div dangerouslySetInnerHTML={{ __html: map }} id="svg-map" />
              </TransformComponent>
            </TransformWrapper>
          </div>
        </div>
      )}

      {!map && (
        <div className="flex h-full flex-col items-center justify-center">
          <div className="mb-4 text-2xl font-bold">Загрузите файл карты</div>
          <div className="mb-4 text-gray-500">
            Для создания карты необходимо загрузить файл с расширением .svg
          </div>
          <input
            type="file"
            accept=".svg"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const reader = new FileReader();
              reader.onload = (e) => {
                const text = e.target?.result as string;
                if (!text) return;

                const parser = new DOMParser();
                const doc = parser.parseFromString(text, "image/svg+xml");
                const svg = doc.querySelector("svg");

                setMap(svg?.outerHTML ?? null);
              };
              reader.readAsText(file);
            }}
          />
        </div>
      )}
    </div>
  );
};

export default MapEditor;
