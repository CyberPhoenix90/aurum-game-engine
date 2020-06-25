import { BlendModes } from 'illusion_engine';
import { NoRenderEntity, NoRenderEntityConfig } from './no_render_entity';

export interface RenderEntityConfig extends NoRenderEntityConfig {
    style: CommonStyle;
}

export interface CommonStyle {
    blendMode?: BlendModes;
}

export abstract class AbstractRenderEntity extends NoRenderEntity {
    constructor(config: RenderEntityConfig) {
        super(config);
    }
}
