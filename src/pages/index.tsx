import { type NextPage } from "next";
import Head from "next/head";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { g, dia, shapes, linkAnchors, linkTools } from "jointjs";
import FloorSvg from "~/components/svg/floor.svg";
import React, { useEffect, useRef } from "react";

import "jointjs/dist/joint.css";
import "jointjs/css/layout.css";
import "jointjs/css/themes/modern.css";

import { generateGraph } from "~/lib/graph";
import MapRoute, { type MapRouteRef } from "~/components/ui/map/MapRoute";
import MapToolsDialog from "~/components/ui/map/MapToolsDialog";
import MapEditor from "~/components/map-editor/MapEditor";

const MouseMode = {
  NONE: "none",
  CREATE_PORT: "create-port",
};

const MapRoutesCration: NextPage = () => {
  return (
    <>
      <Head>
        <title>Содание новигационных маршрутов</title>
        <meta name="description" content="Создание новых маршрутов" />
      </Head>
      <main className="h-screen w-full">
        <MapEditor />
      </main>
    </>
  );
};

export default MapRoutesCration;
