import autoSizeInput from 'autosize-input';
import Vue from 'vue';

Vue.directive('autosize', {
    inserted(el: HTMLElement) {
        (el.children[0] as any).style['min-width'] = '192px';
        autoSizeInput(el.children[0]);
    },
});
