<template>
    <div class="date-format-doc">
        <p>{{ $t('Cashcash use token symbols to describe the format of a date. For example:') }}</p>
        <ul>
            <li>"2014/08/06" {{ $t('follows the format:') }} yyyy/MM/dd</li>
            <li>"6 Aug 2014" {{ $t('follows the format:') }} d MMM yyyy</li>
            <li>
                "2014-08-06T13:07:04.054" {{ $t('follows the format:') }} yyyy-MM-ddTHH:mm:ss.SSS
            </li>
        </ul>
        <p>
            {{ $t('Check.the.table') }}
        </p>
        <el-table :data="docList" height="300">
            <el-table-column width="80" property="token" :label="$t('Token')"></el-table-column>
            <el-table-column property="description" :label="$t('Description')"></el-table-column>
            <el-table-column property="example" :label="$t('Example')"></el-table-column>
        </el-table>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    name: 'date-format-doc',
    components: {},
    props: {},
    data(this: any) {
        return {};
    },
    computed: {
        docList() {
            return [
                { token: 'S', description: this.$t('millisecond no padding'), example: '54' },
                { token: 'SSS', description: this.$t('millisecond padded to 3'), example: '054' },
                { token: 's', description: this.$t('second no padding'), example: '4' },
                { token: 'ss', description: this.$t('second padded to 2 padding'), example: '04' },
                { token: 'm', description: this.$t('minute no padding'), example: '7' },
                { token: 'mm', description: this.$t('minute padded to 2'), example: '07' },
                {
                    token: 'h',
                    description: this.$t('hour in 12-hour time no padding'),
                    example: '1',
                },
                {
                    token: 'hh',
                    description: this.$t('hour in 12-hour time padded to 2'),
                    example: '01',
                },
                {
                    token: 'H',
                    description: this.$t('hour in 24-hour time no padding'),
                    example: '9',
                },
                {
                    token: 'HH',
                    description: this.$t('hour in 24-hour time padded to 2'),
                    example: '13',
                },
                { token: 'Z', description: this.$t('narrow offset'), example: '+5' },
                { token: 'ZZ', description: this.$t('short offset'), example: '+05:00' },
                { token: 'ZZZ', description: this.$t('techie offset'), example: '+0500' },
                { token: 'z', description: this.$t('IANA zone'), example: 'America/New_York' },
                { token: 'a', description: this.$t('meridiem'), example: 'AM' },
                { token: 'd', description: this.$t('day of the month no padding'), example: '6' },
                {
                    token: 'dd',
                    description: this.$t('day of the month padded to 2'),
                    example: '06',
                },
                { token: 'M', description: this.$t('month as an unpadded number'), example: '8' },
                { token: 'MM', description: this.$t('month as an padded number'), example: '08' },
                {
                    token: 'MMM',
                    description: this.$t('month as an abbreviated localized string'),
                    example: 'Aug',
                },
                {
                    token: 'MMMM',
                    description: this.$t('month as an unabbreviated localized string'),
                    example: 'August',
                },
                {
                    token: 'y',
                    description: this.$t('year 1-6 digits very literally'),
                    example: '2014',
                },
                {
                    token: 'yy',
                    description: this.$t('two-digit year, interpreted as > 1960 (also accepts 4)'),
                    example: '14',
                },
                { token: 'yyyy', description: this.$t('four-digit year'), example: '2014' },
            ];
        },
    },
});
</script>
