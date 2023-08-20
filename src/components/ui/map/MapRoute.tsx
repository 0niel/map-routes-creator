import React, {
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
  useEffect,
} from "react";
import * as d3 from "d3";
import { getShortestPath, type Graph, type Vertex } from "~/lib/graph";
import { useMapConfigStore } from "~/lib/stores/map-config-store";

interface MapRouteProps {
  className?: string;
}

export interface MapRouteRef {
  renderRoute: (graph: Graph, startLabel: string, endLabel: string) => void;
}

const MapRoute = forwardRef<MapRouteRef, MapRouteProps>((props, ref) => {
  const [shortestPath, setShortestPath] = useState<Vertex[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [graph, setGraph] = useState<Graph | null>(null);
  const [startLabel, setStartLabel] = useState<string | null>(null);
  const [endLabel, setEndLabel] = useState<string | null>(null);

  const mapConfig = useMapConfigStore();
  const mapConfigRef = useRef(mapConfig);

  useEffect(() => {
    mapConfigRef.current = mapConfig;
  }, [mapConfig]);


  useImperativeHandle(ref, () => ({
    renderRoute: (graph: Graph, startLabel: string, endLabel: string) => {
      setGraph(graph);
      setStartLabel(startLabel);
      setEndLabel(endLabel);

      const path = getShortestPath(
        graph,
        startLabel,
        endLabel,
        mapConfigRef.current.config.objects,
      );

      setShortestPath(path || []);

      if (!path) return;

      if (!svgRef.current || path.length === 0) return;

      const svg = d3.select(svgRef.current);

      // Очистить предыдущие маршруты
      svg.selectAll("line.route").remove();

      // Отрисовка маршрутов
      for (let i = 0; i < path.length - 1; i++) {
        const startPoint = path[i];
        const endPoint = path[i + 1];

        if (startPoint === undefined || endPoint === undefined) {
          continue;
        }

        if (i == 0) {
          startPoint.y += 40;
        } else if (i == path.length - 2) {
          endPoint.y += 40;
          console.log("endPoint.y += 40");
        }

        svg
          .append("line")
          .attr("class", "route")
          .attr("x1", startPoint.x)
          .attr("y1", startPoint.y)
          .attr("x2", endPoint.x)
          .attr("y2", endPoint.y)
          .attr("stroke", "red")
          .attr("stroke-width", 5)
          .attr("stroke-linecap", "round")
          .attr("stroke-linejoin", "round");
      }
    },
  }));

  return (
    <svg
      ref={svgRef}
      width={"100%"}
      height={"100%"}
      className={props.className}
    ></svg>
  );
});

MapRoute.displayName = "MapRoute";

export default MapRoute;
