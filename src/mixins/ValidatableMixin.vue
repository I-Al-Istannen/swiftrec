<script lang="ts">
import Vue from "vue";
import { Inject } from "vue-property-decorator";
import Component from "vue-class-component";

export interface Validatable {
  /**
   * Returns true if the element is valid.
   */
  validate(): boolean;
}

export interface Validator {
  register(input: Validatable): void;
  unregister(input: Validatable): void;
  validate(): void;
}

@Component
export default class ValidatableMixin extends Vue implements Validatable {
  @Inject({
    // eslint-disable-next-line
    default: () => ({ register() {}, unregister() {}, validate() {} })
  })
  protected readonly validator!: Validator;

  created() {
    this.validator && this.validator.register(this);
  }
  beforeDestroy() {
    this.validator && this.validator.unregister(this);
  }

  validate(): boolean {
    return true;
  }
}
</script>
