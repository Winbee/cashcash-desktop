<template>
    <complex-form-item :label="$t('Actions')">
        <div class="inside-item">
            <transition-group name="flip-list" tag="div">
                <action-extra-component
                    v-for="(item, index) in d_wipAction.jsonActionList"
                    :key="'action-rule-' + item.randomId"
                    :itemObject="item"
                    :index="index"
                    :propertyName="'detail'"
                    :removable="true"
                    :upable="index > 0"
                    :downable="index < d_wipAction.jsonActionList.length - 1"
                    @remove="removeSubConfig('jsonActionList', index)"
                    @moveUp="moveUpSubConfig('jsonActionList', index)"
                    @moveDown="moveDownSubConfig('jsonActionList', index)"
                />
            </transition-group>
        </div>
        <div class="button-wrapper">
            <el-button @click="addSubConfig('jsonActionList')" class="item" size="mini">
                <fa icon="plus" fixed-width></fa>
            </el-button>
        </div>
    </complex-form-item>
</template>

<script lang="ts">
import Vue from 'vue';
import CashAction from '../../backend/database/entity/CashAction';
import ComplexFormItem from '../../components/ComplexFormItem.vue';
import ActionExtraComponent from './ActionExtraComponent.vue';

export default Vue.extend({
    name: 'action-edit-component',
    components: {
        ComplexFormItem,
        ActionExtraComponent,
    },
    props: {
        wipAction: {
            type: Object as () => CashAction,
            required: false,
        },
    },
    data(this: any) {
        return {
            d_wipAction: this.wipAction,
            rules: {},
        };
    },
    computed: {},
    methods: {
        addSubConfig(propertyName: 'jsonActionList') {
            const list = this.d_wipAction.jsonActionList;
            const randomId = Math.random();
            list.push({ randomId });
        },
        removeSubConfig(propertyName: 'jsonActionList', index: number) {
            this.d_wipAction.jsonActionList.splice(index, 1);
        },
        moveUpSubConfig(propertyName: 'jsonActionList', index: number) {
            const list = this.d_wipAction.jsonActionList;
            list.splice(index - 1, 0, list.splice(index, 1)[0]);
        },
        moveDownSubConfig(propertyName: 'jsonActionList', index: number) {
            const list = this.d_wipAction.jsonActionList;
            list.splice(index + 1, 0, list.splice(index, 1)[0]);
        },
    },
});
</script>

<style lang="scss" scoped>
h3 {
    border-bottom: 1px solid #97a8be;
}

.flip-list-move {
    transition: transform 1s;
}
.flip-list-enter-active,
.flip-list-leave-active {
    transition: opacity 0.5s;
}
.flip-list-enter,
.flip-list-leave-to {
    opacity: 0;
}
.inside-item {
    background-color: #f0f3f7;
    border-radius: 3px;
}

.button-wrapper {
    padding-top: 6px;
}

.complex-form-item {
    margin-bottom: 24px;
}
</style>
