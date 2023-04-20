import { g, mvc, ui } from '@clientio/rappid';

interface VirtualRenderingOptions {
    threshold?: number;
}

export function enableVirtualRendering(scroller: ui.PaperScroller, options: VirtualRenderingOptions = {}) {
    const { paper } = scroller.options;
    const { threshold = 0 } = options;

    let viewportArea: g.Rect;
    function updateViewportArea() {
        viewportArea = scroller.getVisibleArea().inflate(threshold);
    }

    // Setup listeners
    updateViewportArea();
    scroller.on('scroll', updateViewportArea);
    paper.on('scale', updateViewportArea);

    // Paper `viewport` option
    // https://resources.jointjs.com/docs/jointjs/#dia.Paper.prototype.options.viewport
    paper.options.viewport = (view: mvc.View<any>) => {
        const { model } = view;
        // Hide elements and links which are not in the viewport.
        const bbox = model.getBBox();
        if (model.isLink()) {
            // Vertical/horizontal links have zero width/height.
            bbox.inflate(1);
        }
        return viewportArea.intersect(bbox) !== null;
    };
}
