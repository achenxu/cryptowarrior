
import {LayoutBase, LayoutDetails} from "./LayoutBase";
import {Events} from "../events/Events";
import {Log} from "../Logger";

const logger = Log.getLogger("ScreenManager");
export class ScreenManager {

    private currentScreenIndex: number = 0;

    constructor(private eventHub: PubSubJS.Base, private screens: LayoutBase[]) {
        this.eventHub.subscribe(Events.ScreenChanged, this.onScreenChanged.bind(this));
    }

    public async load(index: number) {
        const screen = this.screens[index];
        logger.info(`Loading screen...`);
        screen.init();
        this.currentScreenIndex = index;
        try {
            await screen.load();
            logger.info("Screen loaded");
        } catch (e) {
            logger.error(e);
        }
    }

    private current(): LayoutBase {
        return this.screens[this.currentScreenIndex];
    }

    private async unload(index: number) {
        const screen = this.current();
        await screen.unload();
    }

    private async onScreenChanged(msg, data) {
        const layoutDetails = data as LayoutDetails;
        logger.info(`New screen selected. ${layoutDetails.index}/${layoutDetails.name}`);
        if (layoutDetails.index === this.currentScreenIndex) {
            logger.info(`Screen selection ignored. Already on screen ${layoutDetails.name}`);
            return;
        }
        await this.unload(this.currentScreenIndex);
        await this.load(layoutDetails.index);
    }
}
