import { type dia, shapes } from "jointjs";
import React, { useCallback, useEffect, useMemo, useRef } from "react";

import "jointjs/dist/joint.css";
import "jointjs/css/layout.css";
import "jointjs/css/themes/modern.css";

import { getLinkToolsView, createPaper } from "~/lib/joint-utils";
import { useJointCanvasStore } from "~/lib/stores/joint-canvas-store";
import { useMapConfigStore } from "~/lib/stores/map-config-store";
import { MouseMode } from "./MapEditor";
import { MapObject } from "~/lib/figma-map-config";

interface MapCanvasProps {
  setPanZoomEnabled: (panZoomEnabled: boolean) => void;
  mouseMode: MouseMode;
  setMouseMode: (mouseMode: MouseMode) => void;
  onMapObjectDoubleClick: (mapObject: MapObject) => void;
}

const MapCanvas = ({
  setPanZoomEnabled,
  mouseMode,
  setMouseMode,
  onMapObjectDoubleClick,
  ...props
}: MapCanvasProps & React.HTMLAttributes<HTMLDivElement>) => {
  const mapConfig = useMapConfigStore();
  const mapConfigRef = useRef(mapConfig);

  useEffect(() => {
    mapConfigRef.current = mapConfig;
  }, [mapConfig]);

  const canvasRef = useRef<HTMLDivElement>(null);

  const jointCanvas = useJointCanvasStore();

  const mouseModeRef = useRef(mouseMode);

  useEffect(() => {
    if (mouseMode === MouseMode.CREATE_PORT) {
      document.body.style.cursor = "crosshair";
    } else if (mouseMode === MouseMode.NONE) {
      document.body.style.cursor = "default";
    }

    mouseModeRef.current = mouseMode;
  }, [mouseMode]);

  const getMapObjectByElement = (element: Element) => {
    const closest = element.closest("[data-object]");

    if (closest) {
      const mapObjectHtmlElement = closest.getAttribute("data-object");

      if (mapObjectHtmlElement) {
        const objectType = mapObjectHtmlElement.split("__")[1];
        const objectId = mapObjectHtmlElement.split("__")[2];

        if (!objectId) return null;

        const mapObject = mapConfigRef.current.config.objects.find(
          (object) => object.id === objectId,
        );

        return mapObject;
      }
    }

    return null;
  };

  const handlePointerMove = useCallback((cellView: dia.CellView) => {
    const rect = cellView.el.getBoundingClientRect();
    const elements = document.elementsFromPoint(rect.left, rect.top);

    for (const el of elements) {
      const mapObject = getMapObjectByElement(el);
      if (!mapObject) continue;

      cellView.model.attr(".id/text", mapObject?.id || "");
      cellView.model.attr(".label/text", mapObject?.name || "");
    }
  }, []);

  const handleBlankPointerDown = useCallback(
    (evt: dia.Event, x: number, y: number) => {
      if (mouseModeRef.current !== MouseMode.CREATE_PORT) return;
      if (evt.button !== 0) return;

      const cell = new shapes.devs.Model({
        type: "devs.Model",
        position: { x: x, y: y },
        attrs: {
          ".label": {
            text: "Объект",
          },
          ".body": {
            display: "none",
          },
        },

        size: { width: 30, height: 10 },

        portMarkup:
          '<g class="port">' + '<circle class="port-body" r="10"/>' + "</g>",

        inPorts: [""],
      });

      jointCanvas.graph.addCells([cell]);

      setMouseMode(MouseMode.NONE);
    },
    [jointCanvas.graph, setMouseMode],
  );

  const getPaper = useMemo(() => {
    const paper = createPaper(jointCanvas.graph);

    paper.on("blank:pointerdown", function (evt, x, y) {
      setPanZoomEnabled(true);
    });

    paper.on("cell:pointerup blank:pointerup", function (cellView, event) {
      setPanZoomEnabled(false);
    });

    paper.on("cell:pointermove", handlePointerMove);

    paper.on("blank:pointerdown", handleBlankPointerDown);

    paper.on("link:mouseenter", function (linkView) {
      linkView.addTools(getLinkToolsView());
    });

    paper.on("link:mouseleave", function (linkView) {
      linkView.removeTools();
    });

    paper.on("cell:pointerdblclick", function (cellView) {
      const objId = cellView.model.attr(".id/text") as string | undefined;
      const mapObject = mapConfigRef.current.config.objects.find(
        (object) => object.id === objId,
      );

      if (mapObject) {
        onMapObjectDoubleClick(mapObject);
      }
    });

    return paper;
  }, [
    jointCanvas.graph,
    handlePointerMove,
    handleBlankPointerDown,
    mapConfig.config.objects,
  ]);

  useEffect(() => {
    if (canvasRef.current) {
      if (canvasRef.current.childNodes.length === 0)
        canvasRef.current.appendChild(getPaper.el);
    }

    jointCanvas.setPaper(getPaper);
  }, [canvasRef, getPaper]);

  const exportGraph = () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const json = graph.toJSON();

    const element = document.createElement("a");
    const file = new Blob([JSON.stringify(json)], {
      type: "application/json",
    });
    element.href = URL.createObjectURL(file);
    element.download = "graph.json";
    document.body.appendChild(element); // Required for this to work in FireFox
    element.click();
  };

  return <div ref={canvasRef} {...props} />;
};

export default MapCanvas;
