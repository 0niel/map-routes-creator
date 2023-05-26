import React, { useRef, useEffect, useState, useImperativeHandle, forwardRef } from "react";
import * as d3 from "d3";
import { Graph, Vertex } from "~/lib/graph";


interface MapRouteProps {
  className?: string;
}

export interface MapRouteRef {
  renderRoute: (graph: Graph, startLabel: string, endLabel: string) => void;
}

const getShortestPath = (graph: Graph, startLabel: string, endLabel: string): Vertex[] | null => {
  if (graph.vertices.length === 0) return null;

  const dijkstra = (graph: Graph, start: Vertex, end: Vertex) => {
    const dist = new Map<string, number>();
    const prev = new Map<string, Vertex | null>();

    for (const vertex of graph.vertices) {
      dist.set(vertex.id, Infinity);
      prev.set(vertex.id, null);
    }

    dist.set(start.id, 0);

    const unvisited = new Set(graph.vertices);

    while (unvisited.size) {
      let closest: Vertex | null = null;

      for (const vertex of unvisited) {
        if (!closest || dist.get(vertex.id)! < dist.get(closest.id)!) {
          closest = vertex;
        }
      }

      unvisited.delete(closest!);

      if (closest === end) break;

      for (const edge of graph.edges) {
        if (edge.source === closest?.id || edge.target === closest?.id) {
          const neighborId = edge.source === closest.id ? edge.target : edge.source;
          const neighbor = graph.vertices.find((v) => v.id === neighborId)!;

          if (neighbor) {  // Добавьте это условие для проверки существования соседа
            const alt = dist.get(closest.id)! + edge.weight;
            if (alt < dist.get(neighbor.id)!) {
              dist.set(neighbor.id, alt);
              prev.set(neighbor.id, closest);
            }
          }
        }
      }
    }

    const path = [];
    let u = end;
    while (u) {
      path.unshift(u);
      u = prev.get(u.id)!;
    }

    return path;
  };

  const start = graph.vertices.find((v) => v.label === startLabel);
  const end = graph.vertices.find((v) => v.label === endLabel);

  if (!start || !end) return null;

  const path = dijkstra(graph, start, end);

  return path;
};


const MapRoute = forwardRef<MapRouteRef, MapRouteProps>((props, ref) => {
  const [shortestPath, setShortestPath] = useState<Vertex[]>([]);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const [graph, setGraph] = useState<Graph | null>(null);
  const [startLabel, setStartLabel] = useState<string | null>(null);
  const [endLabel, setEndLabel] = useState<string | null>(null);

  useImperativeHandle(ref, () => ({
      renderRoute: (graph: Graph, startLabel: string, endLabel: string) => {
        setGraph(graph);
        setStartLabel(startLabel);
        setEndLabel(endLabel);

        console.log("renderRoute");

        const path = getShortestPath(graph, startLabel, endLabel);

        setShortestPath(path || []);

        if (!path) return;


        console.log(svgRef.current, path);

        if (!svgRef.current || path.length === 0) return;

        console.log(`svgRef.current is not null`);

        const svg = d3.select(svgRef.current);

        console.log(`svg: `, svg);

        // Очистить предыдущие маршруты
        svg.selectAll("line.route").remove();

        // Отрисовка маршрутов
        for (let i = 0; i < path.length - 1; i++) {
          let startPoint = path[i];
          let endPoint = path[i + 1];

          if (i == 0 ){
            startPoint.y += 40;
          } else if (i == path.length - 2){
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
            .attr("stroke-linejoin", "round")

        }
      }
    }
  ));


  return <svg ref={svgRef} width={"100%"} height={"100%"} className={props.className}></svg>;
});

export default MapRoute;
