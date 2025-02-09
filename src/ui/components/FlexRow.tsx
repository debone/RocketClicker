import {
  AbstractFlex,
  ALIGN_ITEMS,
  AlignmentItems,
  DIRECTION,
  FlexElement,
  FlexProps,
  JUSTIFY,
  Justify,
} from "./AbstractFlex";

/**
 * Alignment values for the flex row
 *
 * This is meant not to be exported! We don't want to be confused with AlignItems
 */
const ALIGNMENT = {
  JUSTIFY: "justify",
  STRETCH: "stretch",
  TOP: "top",
  RIGHT: "right",
  BOTTOM: "bottom",
  LEFT: "left",
  CENTER: "center",
  SPACE_BETWEEN: "space-between",
  SPACE_AROUND: "space-around",
  SPACE_EVENLY: "space-evenly",
} as const;

type Alignment = (typeof ALIGNMENT)[keyof typeof ALIGNMENT];

export class FlexRow extends AbstractFlex {
  constructor(config: FlexProps) {
    super(config);
    this.direction = DIRECTION.ROW;
  }

  add(
    child: FlexElement,
    flexGrow: number = 0,
    flexShrink: number = 1
  ): FlexElement {
    super.add(child, flexGrow, flexShrink);

    this.height = Math.max(this.height, child.height + this.padding * 2);

    this.width = Math.max(
      this.width,
      this.getAxisTotalSizeSum() + this.padding * 2
    );

    this.layout();
    return child;
  }

  setJustify(justify: Justify): this {
    this.justify = justify;

    switch (justify) {
      case JUSTIFY.FLEX_START:
        this.updateAxis(ALIGNMENT.LEFT);
        break;
      case JUSTIFY.FLEX_END:
        this.updateAxis(ALIGNMENT.RIGHT);
        break;
      case JUSTIFY.CENTER:
        this.updateAxis(ALIGNMENT.CENTER);
        break;
      case JUSTIFY.SPACE_BETWEEN:
        this.updateAxis(ALIGNMENT.SPACE_BETWEEN);
        break;
      case JUSTIFY.SPACE_AROUND:
        this.updateAxis(ALIGNMENT.SPACE_AROUND);
        break;
      case JUSTIFY.SPACE_EVENLY:
        this.updateAxis(ALIGNMENT.SPACE_EVENLY);
        break;
      default:
        throw new Error(`Unknown justify: ${justify}`);
    }

    return this;
  }

  setAlign(align: AlignmentItems): this {
    this.align = align;

    switch (align) {
      case ALIGN_ITEMS.FLEX_START:
        this.updateCrossAxis(ALIGNMENT.TOP);
        break;
      case ALIGN_ITEMS.FLEX_END:
        this.updateCrossAxis(ALIGNMENT.BOTTOM);
        break;
      case ALIGN_ITEMS.CENTER:
        this.updateCrossAxis(ALIGNMENT.CENTER);
        break;
      case ALIGN_ITEMS.STRETCH:
        this.updateCrossAxis(ALIGNMENT.STRETCH);
        break;
      default:
        throw new Error(`Unknown align: ${align}`);
    }

    return this;
  }

  getFreeSpace(): number {
    return this.innerBounds.width - this.axisSizeSum;
  }

  getAxisTotalSizeSum(): number {
    const spaceJustifications: Partial<Justify>[] = [
      JUSTIFY.SPACE_BETWEEN,
      JUSTIFY.SPACE_AROUND,
      JUSTIFY.SPACE_EVENLY,
    ];
    const isSpaceJustification = spaceJustifications.includes(this.justify);

    return (
      this.axisSizeSum +
      (isSpaceJustification ? 0 : this.margin * (this.children.length - 1))
    );
  }

  updateAxis(align: Alignment): void {
    let freeSpace = this.getFreeSpace();

    if ((this.growSum && freeSpace >= 0) || freeSpace < 0) {
      // TODO: handle this
    }

    let position = 0;
    let padding = 0;

    switch (align) {
      case ALIGNMENT.LEFT: {
        position = this.innerBounds.left;
        padding = this.margin;
        break;
      }
      case ALIGNMENT.CENTER: {
        position =
          this.innerBounds.left +
          (this.innerBounds.width / 2 - this.getAxisTotalSizeSum() / 2);
        padding = this.margin;
        break;
      }
      case ALIGNMENT.RIGHT: {
        position = this.innerBounds.right - this.getAxisTotalSizeSum();
        padding = this.margin;
        break;
      }
      case ALIGNMENT.SPACE_BETWEEN: {
        position = this.innerBounds.left;
        padding = freeSpace / (this.children.length - 1);
        break;
      }
      case ALIGNMENT.SPACE_AROUND: {
        padding = freeSpace / this.children.length;
        position = this.innerBounds.left + padding / 2;
        break;
      }
      case ALIGNMENT.SPACE_EVENLY: {
        padding = freeSpace / (this.children.length + 1);
        position = this.innerBounds.left + padding;
        break;
      }
    }

    this.children.forEach((item) => {
      if (item.setOrigin) {
        item.setOrigin(0, 0);
      }
      item.setX(position);
      position += item.width + padding;
    });
  }

  updateCrossAxis(align: Alignment): void {
    let position = 0;
    let scale = 0;

    switch (align) {
      case ALIGNMENT.TOP: {
        position = this.innerBounds.top;
        scale = 0;
        break;
      }
      case ALIGNMENT.CENTER: {
        position = this.innerBounds.top + this.innerBounds.height / 2;
        scale = 0.5;
        break;
      }
      case ALIGNMENT.BOTTOM: {
        position = this.innerBounds.bottom;
        scale = 1;
        break;
      }
      case ALIGNMENT.STRETCH: {
        position = this.innerBounds.top;
        scale = 0;
        // Set the height of the item to the height of the flex
        this.children.forEach((item) => {
          item.setHeight(this.innerBounds.height);
        });
        break;
      }
    }

    this.children.forEach((item) => {
      if (item.setOrigin) {
        item.setOrigin(0, 0);
      }
      item.setY(position - item.height * scale);
    });
  }

  trashLayout(): void {
    super.trashLayout();

    this.width = this.minWidth;
    this.height = this.minHeight;

    let axisSizeSum = this.getAxisTotalSizeSum();

    this.children.forEach((child) => {
      this.width = Math.max(this.width, axisSizeSum + this.padding * 2);
      this.height = Math.max(this.height, child.height + this.padding * 2);
    });

    this.layout();
  }
}
