import { dia, shapes, g, linkAnchors, linkTools } from "jointjs";

const vertexAnchor = function (view, magnet, ref, opt) {
    const vertices = view.model.vertices();
    const { index = 0 } = opt;
    if (vertices.length > index) {
        return new g.Point(vertices[index]);
    }
    return view.sourcePoint;
};

const connectionStrategy = function (
    end: dia.Link.EndJSON,
    view: dia.CellView,
    magnet: SVGElement,
    coords: dia.Point
): dia.Link.EndJSON {
    if (view.model.isElement()) return end;

    const vertices = (view.model as dia.Link).vertices();
    if (vertices.length === 0) return end;
    const point = new g.Point(coords);
    const vertex = point.chooseClosest(vertices);
    if (!vertex) return end;
    console.log("CONNECTION STRATEGY")
    const index = vertices.findIndex((v) => vertex.equals(v as g.Point));
    end.anchor = {
        name: "vertexAnchor",
        args: { index },
    };
    return end;
}

export const getLinkToolsView = () => {
    const verticesTool = new linkTools.Vertices({
        redundancyRemoval: false,
        snapRadius: 10,
        vertexAdding: false,
    });

    const sourceArrowheadTool = new linkTools.SourceArrowhead();
    const targetArrowheadTool = new linkTools.TargetArrowhead();
    const sourceAnchorTool = new linkTools.SourceAnchor();
    const targetAnchorTool = new linkTools.TargetAnchor();
    const removeButton = new linkTools.Remove();

    return new dia.ToolsView({
        tools: [
            verticesTool,
            sourceArrowheadTool,
            targetArrowheadTool,
            sourceAnchorTool,
            targetAnchorTool,
            removeButton,
        ],
    });
};

export const createPaper = (graph: dia.Graph): dia.Paper => {
    const paper = new dia.Paper({
        cellViewNamespace: {
            devs: shapes.devs,
            standard: shapes.standard,
            shapes: shapes,
        },

        width: "100%",
        height: "100%",

        model: graph,
        async: true,

        gridSize: 5,
        sorting: dia.Paper.sorting.APPROX,

        background: { color: "transparent" },

        connectionStrategy: connectionStrategy,

        linkAnchorNamespace: {
            ...linkAnchors,
            vertexAnchor,
        },

        validateConnection: (srcView, _, tgtView) => {
            const src = srcView.model;
            const tgt = tgtView.model;
            if (src === tgt) return false;
            return true;
        },

        defaultLink: new shapes.devs.Link({
            attrs: {
                ".connection": {
                    stroke: "#000000",
                    "stroke-width": 1,
                },
                ".marker-target": {
                    fill: "#000000",
                    d: "M 10 0 L 0 5 L 10 10 z",
                },
                ".marker-arrowheads": {
                    display: "none",
                },
                ".link-tools": {
                    display: "none",
                },
                ".marker-vertices": {
                    display: "none",
                },
            },
        }),
    });

    return paper;
}

export const createGraph = (): dia.Graph => {
    return new dia.Graph(
        {},
        {
            cellNamespace: {
                devs: shapes.devs,
                standard: shapes.standard,
                shapes: shapes,
            },
        }
    )
}

export const exportToJSON = (graph: dia.Graph): string => {
    //   

}