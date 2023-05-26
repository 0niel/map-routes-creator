import { dia } from "jointjs";
import { v4 as uuidv4 } from "uuid";

export interface Vertex {
  id: string;
  x: number;
  y: number;
  label: string;
}

export interface Edge {
  source: string;
  target: string;
  weight: number;
}

export interface Graph {
  vertices: Vertex[];
  edges: Edge[];
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
  return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
}

export function generateGraph(data: dia.Graph): Graph {
  const vertices: Vertex[] = data.getCells()
    .filter((cell: dia.Cell) => cell.attributes.type === "RoomPoint")
    .map((cell: dia.Cell) => ({
      id: cell.id,
      x: cell.attributes.position.x,
      y: cell.attributes.position.y,
      label: cell.attr(".label").text
    }));

  const edges: Edge[] = [];

  data.getCells()
    .filter((cell: dia.Cell) => cell.attributes.type === "devs.Link")
    .forEach((cell: dia.Cell) => {
      const sourceId = (cell.get("source") as { id: string }).id;
      const targetId = (cell.get("target") as { id: string }).id;

      const sourceVertex = vertices.find((v) => v.id === sourceId);
      const targetVertex = vertices.find((v) => v.id === targetId);

      if (sourceVertex && targetVertex) {
        let intermediateVertices: Vertex[] = [];
        if (cell.attributes.vertices !== undefined) {
          intermediateVertices = ((cell.attributes.vertices as dia.Link.Vertex[])
            .map((vertex: { x: number, y: number }) => ({
              id: uuidv4(),
              x: vertex.x,
              y: vertex.y
            })) ?? []) as Vertex[];
        }
        const completeVertices = [sourceVertex, ...intermediateVertices, targetVertex];

        completeVertices.reduce((prevVertex, curVertex) => {
          const weight = distance(prevVertex.x, prevVertex.y, curVertex.x, curVertex.y);
          edges.push({ source: prevVertex.id, target: curVertex.id, weight });

          return curVertex;
        });

        vertices.push(...intermediateVertices);
      }
    });

  const getVertexInPoint = (x: number, y: number): Vertex | undefined => {
    return vertices.find((v) => v.x === x && v.y === y);
  };

  data.getCells()
    .filter((cell: dia.Cell) => cell.attributes.type === "devs.Link")
    .forEach((cell: dia.Cell) => {
      const sourceId = (cell.get("source") as { id: string }).id;
      let targetId = (cell.get("target") as { id: string }).id;
      const targetAnchor = (cell.get("target") as { anchor: { name: string, args: { index: number } } }).anchor;

      if (targetAnchor && targetAnchor.name === "vertexAnchor") {
        const targetLink = data.getCell(targetId) as dia.Link;
        if (targetLink.attributes.vertices) {
          const targetVertexIndex = targetAnchor.args.index;
          let targetVertex = targetLink.attributes.vertices[targetVertexIndex];
          targetId = getVertexInPoint(targetVertex.x, targetVertex.y)?.id ?? targetId;
        }

        // Generate here intermediate vertices
        const sourceVertex = vertices.find((v) => v.id === sourceId);
        const targetVertex = vertices.find((v) => v.id === targetId);

        if (sourceVertex && targetVertex) {
          let intermediateVertices: Vertex[] = [];
          if (cell.attributes.vertices !== undefined) {
            intermediateVertices = ((cell.attributes.vertices as dia.Link.Vertex[])
              .map((vertex: { x: number, y: number }) => ({
                id: uuidv4(),
                x: vertex.x,
                y: vertex.y
              })) ?? []) as Vertex[];
          }
          const completeVertices = [sourceVertex, ...intermediateVertices, targetVertex];

          completeVertices.reduce((prevVertex, curVertex) => {
            const weight = distance(prevVertex.x, prevVertex.y, curVertex.x, curVertex.y);
            edges.push({ source: prevVertex.id, target: curVertex.id, weight });

            return curVertex;
          });

          vertices.push(...intermediateVertices);
        }
      }
    });

  return { vertices, edges };
}
