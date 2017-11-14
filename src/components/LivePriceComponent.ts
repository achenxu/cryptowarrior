import { Events } from "../events/events";
import { GdaxApi } from "../sources/GdaxApi";
import { IComponent, ComponentBase, WidgetOpts } from "./Component";
import {Throttle} from "../events/Throttle";
import {IStreamingSource} from "../sources/Interfaces";
import {LivePrice} from "../types/LivePrice";
const contrib = require("blessed-contrib");

export class LivePriceComponent extends ComponentBase implements IComponent {
    public lcd: any;

    private throttle: Throttle;

    constructor(eventHub, private source: IStreamingSource<LivePrice>) {
        super(eventHub);
        this.throttle = new Throttle(200);
    }

    public getWidgetOpts(opts?: any): WidgetOpts {
        return new WidgetOpts(contrib.lcd,
            {
                label: "BTC-USD",
                strokeWidth: 1,
                elements: 4,
                display: "0000",
            });
    }

    public setWidget(widget: any) {
        this.lcd = widget;
    }

    public configure(widget: any, opts?: any) {

    }

    public async load(opts?: any) {
        const callback = (data) => this.onPriceChanged(data);
        this.source.subscribe(["BTC-USD"], callback);
    }

    public onPriceChanged(livePrice: LivePrice) {

        if (!this.throttle.tryRemoveToken()) {
            return;
        }
        this.lcd.setDisplay(livePrice.price);
        // todo: too heavy-weight? just mark component as dirty?
        this.eventHub.publish(Events.UIUpdate, null);
    }

}
