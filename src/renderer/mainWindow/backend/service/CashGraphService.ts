import { Service } from 'typedi';
import GraphUtils from '../utils/GraphUtils';
import { TransactionParameters } from './dto/Parameters';
import GraphSplit from './dto/GraphSplit';
import CashAccount from '../database/entity/CashAccount';
import CashCurrency from '../database/entity/CashCurrency';
import PrintUtils from '../utils/PrintUtils';
import CashAccountUtils from '../utils/CashAccountUtils';
import { AccountCurrencyKey } from '../database/entity/proxy/CashKey';
import StringUtils from '../utils/StringUtils';
import { format, parse, isSameYear } from 'date-fns';
import DateUtils from '../utils/DateUtils';
import { EChartOption } from 'echarts';
import GraphSplitExtended from './dto/GraphSplitExtended';
import _ from 'lodash';
import InOutType from '../database/entity/enumeration/InOutType';
import i18n from '@/renderer/common/i18n/i18n';

@Service()
export default class CashGraphService {
    async generateInternalGraph(
        parameters: TransactionParameters,
        splitList: GraphSplitExtended[],
        splitSumList: GraphSplit[],
        accountMap: Map<number, CashAccount>,
        currencyMap: Map<number, CashCurrency>,
        useOriginalCurrency: boolean = false,
        merged: boolean = true,
    ): Promise<EChartOption> {
        // Filter
        const graphSplitList = GraphUtils.filterDataExtended(splitList, parameters, accountMap);
        const graphSplitSumList = GraphUtils.filterData(splitSumList, parameters, accountMap);

        // Reduce
        const graphSplitMap = GraphUtils.reduceToMapOfList(
            graphSplitList,
            useOriginalCurrency,
            merged,
        );
        const graphSplitSumtMap = GraphUtils.reduceToMapOfOne(
            graphSplitSumList,
            useOriginalCurrency,
            merged,
        );

        const amountField = useOriginalCurrency ? 'originalAmount' : 'amount';
        const currencyField = useOriginalCurrency ? 'originalCurrencyId' : 'currencyId';
        const datasetList: { source: GraphSplit[]; dimensions: any }[] = [];
        const serieList: any = [];
        graphSplitMap.forEach((value, key, map) => {
            const splitSum = graphSplitSumtMap.get(key);
            if (!splitSum) {
                throw new Error(`No splitSum found for the key: ${key}`);
            }
            let list = GraphUtils.reduceBySum(value, splitSum, useOriginalCurrency);
            list = GraphUtils.reduceByAddingBorderValue(
                list,
                parameters.transactionDateFrom!,
                parameters.transactionDateTo!,
            );
            datasetList.push({
                dimensions: [
                    { name: 'transactionDate', type: 'time' },
                    { name: amountField, type: 'float' },
                    { name: 'accountId', type: 'int' },
                    { name: currencyField, type: 'int' },
                ],
                source: list,
            });

            serieList.push({
                datasetIndex: datasetList.length - 1,
                type: 'line',
                encode: {
                    x: 'transactionDate',
                    y: amountField,
                },
            });
        });

        const graphic: any = [];
        if (serieList.length === 0) {
            graphic.push({
                type: 'text',
                z: 100,
                left: 'center',
                top: 'center',
                style: {
                    text: i18n.t('No data'),
                },
            });
        }

        let yAxisCurrencyId;
        if (splitList.length > 0) {
            if (useOriginalCurrency) {
                yAxisCurrencyId = splitList[0].originalCurrencyId;
            } else {
                yAxisCurrencyId = splitList[0].currencyId;
            }
        }

        return {
            dataset: datasetList,
            series: serieList,
            tooltip: {
                trigger: 'axis',
                formatter: (params: object | any[]) => {
                    return this.formatTooltip(
                        params,
                        accountMap,
                        currencyMap,
                        useOriginalCurrency,
                        merged,
                    );
                },
                axisPointer: {
                    animation: true,
                },
            },
            xAxis: {
                type: 'time',
                splitLine: {
                    show: false,
                },
            },
            yAxis: {
                type: 'value',
                boundaryGap: ['20%', '20%'],
                axisLabel: {
                    formatter: (value) =>
                        this.formatYAxisLabel(value, yAxisCurrencyId, currencyMap),
                },
            },
            grid: {
                left: 85,
            },
            graphic,
            color: GraphUtils.getDefaultColorPalette(),
        };
    }

    async generateInOutGraph(
        parameters: TransactionParameters,
        splitList: GraphSplitExtended[],
        accountMap: Map<number, CashAccount>,
        currencyMap: Map<number, CashCurrency>,
        useOriginalCurrency: boolean = false,
        groupByLevel?: number,
    ): Promise<EChartOption> {
        // Filter
        let graphSplitList = GraphUtils.filterDataExtended(splitList, parameters, accountMap);
        if (groupByLevel) {
            graphSplitList = GraphUtils.mapToAccountLevel(graphSplitList, accountMap, groupByLevel);
        }

        // Reduce
        const graphSplitMap = GraphUtils.reduceToMapOfInOutList(graphSplitList);

        const amountField = useOriginalCurrency ? 'originalAmount' : 'amount';
        const currencyField = useOriginalCurrency ? 'originalCurrencyId' : 'currencyId';
        const datasetList: { source: any[]; dimensions: any }[] = [];
        const serieList: any[] = [];
        const legendData: string[] = [];
        graphSplitMap.forEach((value, key, map) => {
            let list = GraphUtils.reduceByMonth(value, useOriginalCurrency);
            list = GraphUtils.reduceByAddingEmptyMonth(
                list,
                parameters.transactionDateFrom!,
                parameters.transactionDateTo!,
                CashAccountUtils.generateKey(list[0].accountId, list[0][currencyField]),
            );
            datasetList.push({
                dimensions: [
                    { name: 'transactionDate', type: 'ordinal' },
                    { name: amountField, type: 'float' },
                    { name: 'accountId', type: 'int' },
                    { name: currencyField, type: 'int' },
                ],
                source: list
                    .map((item) => ({
                        ...item,
                        transactionDate: format(item.transactionDate, 'yyyy-MM'),
                    }))
                    .reverse(),
            });

            serieList.push({
                datasetIndex: datasetList.length - 1,
                type: 'bar',
                stack: key,
                name: key,
                barGap: 0,
                encode: {
                    x: 'transactionDate',
                    y: amountField,
                },
            });

            legendData.push(key);
        });

        const graphic: any = [];
        if (serieList.length === 0) {
            graphic.push({
                type: 'text',
                z: 100,
                left: 'center',
                top: 'center',
                style: {
                    text: i18n.t('No data'),
                },
            });
        }

        let yAxisCurrencyId;
        if (splitList.length > 0) {
            yAxisCurrencyId = splitList[0][currencyField];
        }

        return {
            dataset: datasetList,
            series: serieList.sort((a, b) => a.name.localeCompare(b.name)),
            legend: {
                type: 'scroll',
                bottom: 10,
                data: legendData.sort((a, b) => a.localeCompare(b)),
                formatter: (name: string) => {
                    return i18n.t(name).toString();
                },
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: object | any[]) => {
                    return this.formatInOutTooltip(
                        params,
                        accountMap,
                        currencyMap,
                        useOriginalCurrency,
                    );
                },
                axisPointer: {
                    animation: false,
                },
                position: [10, 10],
            },
            grid: {
                left: 85,
            },
            xAxis: { type: 'category' },
            yAxis: {
                axisLabel: {
                    formatter: (value) =>
                        this.formatYAxisLabel(value, yAxisCurrencyId, currencyMap),
                },
            },
            graphic,
            color: GraphUtils.getDefaultColorPalette(),
        };
    }

    async generateExternalGraph(
        parameters: TransactionParameters,
        splitList: GraphSplit[],
        accountMap: Map<number, CashAccount>,
        currencyMap: Map<number, CashCurrency>,
        inversed: boolean = false,
        groupByLevel?: number,
    ): Promise<EChartOption> {
        // Filter
        let graphSplitList = GraphUtils.filterData(splitList, parameters, accountMap);
        if (groupByLevel) {
            graphSplitList = GraphUtils.mapToAccountLevel(graphSplitList, accountMap, groupByLevel);
        }
        if (inversed) {
            graphSplitList = GraphUtils.inverseAmount(graphSplitList);
        }

        // Reduce
        const graphSplitMap = GraphUtils.reduceToMapOfList(graphSplitList);

        const datasetList: { source: any[]; dimensions: any }[] = [];
        const serieList: any[] = [];
        const legendData: string[] = [];
        graphSplitMap.forEach((value, key, map) => {
            let list = GraphUtils.reduceByMonth(value);
            list = GraphUtils.reduceByAddingEmptyMonth(
                list,
                parameters.transactionDateFrom!,
                parameters.transactionDateTo!,
                key,
            );
            datasetList.push({
                dimensions: [
                    { name: 'transactionDate', type: 'ordinal' },
                    { name: 'amount', type: 'float' },
                    { name: 'accountId', type: 'int' },
                    { name: 'currencyId', type: 'int' },
                ],
                source: list
                    .map((item) => ({
                        ...item,
                        transactionDate: format(item.transactionDate, 'yyyy-MM'),
                    }))
                    .reverse(),
            });

            serieList.push({
                datasetIndex: datasetList.length - 1,
                type: 'bar',
                stack: 'one',
                name: key,
                encode: {
                    x: 'transactionDate',
                    y: 'amount',
                },
            });

            legendData.push(key);
        });

        const graphic: any = [];
        if (serieList.length === 0) {
            graphic.push({
                type: 'text',
                z: 100,
                left: 'center',
                top: 'center',
                style: {
                    text: i18n.t('No data'),
                },
            });
        }

        let yAxisCurrencyId;
        if (splitList.length > 0) {
            yAxisCurrencyId = splitList[0].currencyId;
        }

        return {
            dataset: datasetList,
            series: serieList,
            toolbox: {
                feature: {
                    magicType: {
                        type: ['stack'],
                        emphasis: {
                            iconStyle: {
                                textFill: '#FFFF0',
                            },
                        },
                    },
                },
            },
            legend: {
                type: 'scroll',
                bottom: 10,
                data: legendData,
                formatter: (legendKey) => {
                    return this.formatLegend(legendKey, accountMap);
                },
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: object | any[]) => {
                    return this.formatExternalTooltip(params, accountMap, currencyMap);
                },
                axisPointer: {
                    animation: false,
                },
                position: [10, 10],
            },
            grid: {
                left: 85,
            },
            xAxis: { type: 'category' },
            yAxis: {
                axisLabel: {
                    formatter: (value) =>
                        this.formatYAxisLabel(value, yAxisCurrencyId, currencyMap),
                },
            },
            graphic,
            color: GraphUtils.getDefaultColorPalette(),
        };
    }

    generateBudgetGraph(
        inBudget: number,
        outBudget: number,
        inCurrent: number,
        outCurrent: number,
        inNoneBudgetedCurrent: number,
        outNoneBudgetedCurrent: number,
        currentDate: Date,
        currency: CashCurrency,
        accountMap: Map<number, CashAccount>,
        currencyMap: Map<number, CashCurrency>,
    ): EChartOption {
        const currentDateString = DateUtils.formatHumanMonth(currentDate);
        const currentDateStringWithUpperCase = StringUtils.toUpperCaseFirstLetter(
            currentDateString,
        );
        const datasetList: { source: any[]; dimensions: any }[] = [];
        const serieList: any[] = [];
        const legendData: string[] = [];
        datasetList.push({
            dimensions: [
                { name: 'name', type: 'ordinal' },
                { name: 'amount', type: 'float' },
                { name: 'currencyId', type: 'int' },
            ],
            source: [
                { name: 'IN', amount: inBudget },
                { name: 'OUT', amount: outBudget },
            ],
        });

        datasetList.push({
            dimensions: [
                { name: 'name', type: 'ordinal' },
                { name: 'amount', type: 'float' },
                { name: 'currencyId', type: 'int' },
            ],
            source: [
                { name: 'IN', amount: inCurrent },
                { name: 'OUT', amount: outCurrent },
            ],
        });

        datasetList.push({
            dimensions: [
                { name: 'name', type: 'ordinal' },
                { name: 'amount', type: 'float' },
                { name: 'currencyId', type: 'int' },
            ],
            source: [
                { name: 'IN', amount: inNoneBudgetedCurrent },
                { name: 'OUT', amount: outNoneBudgetedCurrent },
            ],
        });

        serieList.push({
            datasetIndex: 0,
            type: 'bar',
            barGap: 0,
            stack: 'Budget',
            name: 'Budget',
            encode: {
                x: 'name',
                y: 'amount',
            },
        });

        serieList.push({
            datasetIndex: 1,
            type: 'bar',
            barGap: 0,
            stack: 'Current',
            name: currentDateStringWithUpperCase,
            encode: {
                x: 'name',
                y: 'amount',
            },
        });

        serieList.push({
            datasetIndex: 2,
            type: 'bar',
            barGap: 0,
            stack: 'Current',
            name: `${currentDateStringWithUpperCase} (${i18n.t('Not budgeted')})`,
            encode: {
                x: 'name',
                y: 'amount',
            },
        });

        legendData.push(i18n.t('Budget').toString());
        legendData.push(currentDateStringWithUpperCase);
        legendData.push(`${currentDateStringWithUpperCase} (${i18n.t('Not budgeted')})`);

        const graphic: any = [];
        if (serieList.length === 0) {
            graphic.push({
                type: 'text',
                z: 100,
                left: 'center',
                top: 'center',
                style: {
                    text: i18n.t('No data'),
                },
            });
        }

        const yAxisCurrencyId = currency.id;

        return {
            dataset: datasetList,
            series: serieList,
            legend: {
                type: 'scroll',
                bottom: 10,
                data: legendData,
            },
            tooltip: {
                trigger: 'axis',
                formatter: (params: object | any[]) => {
                    return this.formatBudgetTooltip(params, accountMap, currencyMap, currency);
                },
                axisPointer: {
                    animation: false,
                },
                position: [10, 10],
            },
            grid: {
                left: 85,
            },
            xAxis: {
                type: 'category',
                axisLabel: {
                    formatter: (value) => i18n.t(value).toString(),
                },
            },
            yAxis: {
                axisLabel: {
                    formatter: (value) =>
                        this.formatYAxisLabel(value, yAxisCurrencyId, currencyMap),
                },
            },
            graphic,
            color: GraphUtils.getDefaultColorPalette(),
        };
    }

    async generatePieGraph(
        parameters: TransactionParameters,
        splitList: GraphSplitExtended[],
        accountMap: Map<number, CashAccount>,
        currencyMap: Map<number, CashCurrency>,
        useOriginalCurrency: boolean = false,
        maxSize: number,
        filterByDirection: 'isToSplit' | 'isFromSplit',
        useOtherSplitAccountId = false,
        groupByLevel?: number,
    ): Promise<EChartOption> {
        // Filter
        let graphSplitList = GraphUtils.filterDataExtended(splitList, parameters, accountMap);
        if (groupByLevel) {
            graphSplitList = GraphUtils.mapToAccountLevel(
                graphSplitList,
                accountMap,
                groupByLevel,
                useOtherSplitAccountId,
            );
        }

        // Reduce
        const merged = false;
        let graphSplitMap = GraphUtils.reduceToMapOfOneExtended(
            graphSplitList,
            useOriginalCurrency,
            merged,
            useOtherSplitAccountId,
        );
        graphSplitMap = GraphUtils.reduceToTopExtended(
            Array.from(graphSplitMap.values()),
            maxSize,
            useOriginalCurrency,
            useOtherSplitAccountId,
        );

        const positiveDataList: any = [];
        const negativeDataList: any = [];
        const amountField = useOriginalCurrency ? 'originalAmount' : 'amount';
        const remainingAccountsLabel =
            maxSize === 1 ? i18n.t('All accounts') : i18n.t('Remaining accounts') + '...';
        graphSplitMap.forEach((value: GraphSplit, key, map) => {
            const keyObj = CashAccountUtils.extractKey(key);
            const accountName =
                keyObj.accountId === -1
                    ? remainingAccountsLabel
                    : accountMap.get(keyObj.accountId)!.name;
            const isPositive = value[amountField] >= 0;
            const name = `${accountName}: ${isPositive ? '+' : ''}${PrintUtils.printAmount(
                '' + value[amountField],
                +keyObj.currencyId,
                currencyMap,
            )}`;
            if (isPositive && filterByDirection === 'isToSplit') {
                positiveDataList.push({
                    value: value[amountField],
                    name,
                    key,
                });
            } else if (!isPositive && filterByDirection === 'isFromSplit') {
                negativeDataList.push({
                    value: value[amountField],
                    name,
                    key,
                });
            }
        });

        const graphic: any = [];
        if (positiveDataList.length === 0 && negativeDataList.length === 0) {
            graphic.push({
                type: 'text',
                z: 100,
                left: 'center',
                top: 'center',
                style: {
                    text: i18n.t('No data'),
                },
            });
        }

        return {
            tooltip: {
                trigger: 'item',
                formatter: (params: object | any[]) => {
                    return this.formatPieTooltip(params, accountMap, currencyMap);
                },
                confine: true,
            },
            title:
                positiveDataList.length === 0 && negativeDataList.length === 0
                    ? undefined
                    : {
                          text:
                              filterByDirection === 'isToSplit'
                                  ? i18n.t('IN').toString()
                                  : i18n.t('OUT').toString(),
                          textAlign: 'center',
                          textVerticalAlign: 'middle',
                          top: 'middle',
                          left: 'middle',
                      },
            series: [
                {
                    name: 'Positive',
                    type: 'pie',
                    radius: ['60%', '80%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center',
                        },
                        emphasis: {
                            show: false,
                        },
                    },
                    labelLine: {
                        normal: {
                            show: false,
                        },
                    },
                    data: positiveDataList,
                },
                {
                    name: 'Negative',
                    type: 'pie',
                    radius: ['60%', '80%'],
                    avoidLabelOverlap: false,
                    label: {
                        normal: {
                            show: false,
                            position: 'center',
                        },
                        emphasis: {
                            show: false,
                        },
                    },
                    labelLine: {
                        normal: {
                            show: false,
                        },
                    },
                    data: negativeDataList,
                },
            ],
            graphic,
            color: GraphUtils.getDefaultColorPalette(),
        };
    }

    async generateTopBarGraph(
        parameters: TransactionParameters,
        splitList: GraphSplit[],
        accountMap: Map<number, CashAccount>,
        currencyMap: Map<number, CashCurrency>,
        inversed: boolean = false,
        maxSize: number,
    ): Promise<EChartOption> {
        // Filter
        let graphSplitList = GraphUtils.filterData(splitList, parameters, accountMap);
        if (inversed) {
            graphSplitList = GraphUtils.inverseAmount(graphSplitList);
        }

        // Reduce
        let graphSplitMap: Map<AccountCurrencyKey, GraphSplit> = GraphUtils.reduceToMapOfOne(
            graphSplitList,
        );
        graphSplitMap = GraphUtils.reduceToTop(Array.from(graphSplitMap.values()), maxSize);
        const positiveSource: any[] = [];
        const negativeSource: any[] = [];
        const datasetList: { source: any[]; dimensions: any }[] = [
            {
                dimensions: [
                    { name: 'accountId', type: 'int' },
                    { name: 'amount', type: 'float' },
                    { name: 'currencyId', type: 'int' },
                    { name: 'originalAmount', type: 'float' },
                    { name: 'originalCurrencyId', type: 'int' },
                    { name: 'name', type: 'ordinal' },
                ],
                source: positiveSource,
            },
            {
                dimensions: [
                    { name: 'accountId', type: 'int' },
                    { name: 'amount', type: 'float' },
                    { name: 'currencyId', type: 'int' },
                    { name: 'originalAmount', type: 'float' },
                    { name: 'originalCurrencyId', type: 'int' },
                    { name: 'name', type: 'ordinal' },
                ],
                source: negativeSource,
            },
        ];
        const serieList: any = [];
        const remainingAccountsLabel =
            maxSize === 1 ? i18n.t('All accounts') : i18n.t('Remaining accounts') + '...';
        graphSplitMap.forEach((value, key, map) => {
            const keyObj = CashAccountUtils.extractKey(key);
            const accountName =
                keyObj.accountId === -1
                    ? remainingAccountsLabel
                    : accountMap.get(keyObj.accountId)!.name;
            const isPositive = value.amount >= 0;
            if (isPositive) {
                positiveSource.push({
                    ...value,
                    name: accountName,
                });
            } else {
                negativeSource.push({
                    ...value,
                    name: accountName,
                });
            }
        });

        const graphic: any = [];
        if (positiveSource.length === 0 && negativeSource.length === 0) {
            graphic.push({
                type: 'text',
                z: 100,
                left: 'center',
                top: 'center',
                style: {
                    text: i18n.t('No data'),
                },
            });
        } else {
            if (positiveSource.length !== 0) {
                positiveSource.sort((a, b) => a.amount - b.amount);
                serieList.push({
                    datasetIndex: 0,
                    type: 'bar',
                    name: 'top10-positive',
                    barWidth: '25px',
                    label: {
                        show: true,
                        position: 'insideLeft',
                        color: '#191b1e',
                        formatter: (params: any) => {
                            return this.formatTopBarLabel(params, accountMap, currencyMap);
                        },
                    },
                    encode: {
                        x: 'amount',
                        y: 'name',
                    },
                    color: '#6cb4fc',
                });
            }
            if (negativeSource.length !== 0) {
                negativeSource.sort((a, b) => a.amount - b.amount);
                serieList.push({
                    datasetIndex: 1,
                    type: 'bar',
                    name: 'top10-negative',
                    barWidth: '25px',
                    label: {
                        show: true,
                        position: 'insideRight',
                        color: '#191b1e',
                        formatter: (params: any) => {
                            return this.formatTopBarLabel(params, accountMap, currencyMap);
                        },
                    },
                    encode: {
                        x: 'amount',
                        y: 'name',
                    },
                    color: '#ed7371',
                });
            }
        }

        return {
            dataset: datasetList,
            series: serieList,
            grid: {
                top: '3%',
                bottom: '3%',
                left: '3%',
                right: '3%',
            },
            tooltip: {
                trigger: 'axis',
                axisPointer: {
                    type: 'shadow',
                },
                formatter: (params: any) => {
                    return this.formatTopBarTooltip(params, accountMap, currencyMap);
                },
            },
            xAxis: {
                type: 'value',
                axisLine: { show: false },
                axisLabel: { show: false },
                axisTick: { show: false },
                splitLine: { lineStyle: { type: 'dashed' } },
            },
            yAxis: {
                type: 'category',
                axisLine: { show: true },
                axisLabel: { show: false },
                axisTick: { show: false },
                splitLine: { show: false },
            },
            graphic,
        };
    }

    async generateActivityGraph(
        parameters: TransactionParameters,
        splitList: GraphSplitExtended[],
        accountMap: Map<number, CashAccount>,
        currencyMap: Map<number, CashCurrency>,
    ): Promise<EChartOption> {
        // Filter
        const graphSplitList = GraphUtils.keepOneTransaction(splitList);
        let activitySplitList = GraphUtils.convertToActivitySplit(graphSplitList);
        activitySplitList = GraphUtils.reduceByDay(activitySplitList);

        const serieListTemplate = {
            type: 'heatmap',
            coordinateSystem: 'calendar',
            itemStyle: {
                normal: {
                    color: '#ddb926',
                },
            },
            label: {
                normal: {
                    show: true,
                    formatter: '{b}',
                },
            },
        };

        const calendarTemplate: EChartOption.Calendar = {
            width: '80%',
            left: 'center',
            range: [
                DateUtils.formatDate(parameters.transactionDateFrom!),
                DateUtils.formatDate(parameters.transactionDateTo!),
            ],
            splitLine: {
                show: true,
                lineStyle: {
                    color: '#c1c1c1',
                    width: 1,
                    type: 'solid',
                },
            },
            itemStyle: {
                borderWidth: 5,
                borderColor: '#fff',
            },
            yearLabel: {
                formatter: isSameYear(
                    parameters.transactionDateFrom!,
                    parameters.transactionDateTo!,
                )
                    ? '{start}'
                    : '{start} - {end}',
            },
            dayLabel: {
                align: 'right',
                firstDay: 1, // start on Monday
                nameMap: i18n.locale === 'en' ? 'en' : ['D', 'L', 'M', 'M', 'J', 'V', 'S'],
            },
        };

        const visualMapTemplate: EChartOption.VisualMap = {
            calculable: true,
            orient: 'horizontal',
            left: 'center',
            textStyle: {
                color: '#000',
                fontWeight: 'bold',
            },
            realtime: false,
        };
        return {
            series: [
                {
                    ...serieListTemplate,
                    calendarIndex: 0,
                    name: 'by amount',
                    data: activitySplitList.map((o) => [o.stringTransactionDate, o.amount]),
                },
                {
                    ...serieListTemplate,
                    calendarIndex: 1,
                    name: 'by nb of transactions',
                    data: activitySplitList.map((o) => [
                        o.stringTransactionDate,
                        o.nbOfTransactions,
                    ]),
                },
            ],
            tooltip: {
                position: 'top',
                formatter: (p: any) => {
                    const value =
                        p.seriesName === 'by amount'
                            ? PrintUtils.printAmount(
                                  '' + p.data[1],
                                  +activitySplitList[0].currencyId,
                                  currencyMap,
                              )
                            : p.data[1];
                    const dateParsed = parse(p.data[0], 'yyyy-MM-dd', new Date());
                    const dateString = DateUtils.formatHumanDate(dateParsed);
                    const dateStringWithUpperCase = StringUtils.toUpperCaseFirstLetter(dateString);
                    return dateStringWithUpperCase + ': ' + value;
                },
            },
            visualMap: [
                {
                    ...visualMapTemplate,
                    top: 20,
                    seriesIndex: 0,
                    max:
                        activitySplitList.length > 0
                            ? _.maxBy(activitySplitList, (o) => o.amount)!.amount
                            : 0,
                    text: ['', i18n.t('Amount per day').toString()],
                    formatter:
                        activitySplitList.length > 0
                            ? '{value}' + currencyMap.get(splitList[0].currencyId)!.symbol
                            : '{value}',
                },
                {
                    ...visualMapTemplate,
                    top: 270,
                    seriesIndex: 1,
                    max:
                        activitySplitList.length > 0
                            ? _.maxBy(activitySplitList, (o) => o.nbOfTransactions)!
                                  .nbOfTransactions
                            : 0,
                    text: ['', i18n.t('Number of transactions per day').toString()],
                },
            ],
            calendar: [
                {
                    ...calendarTemplate,
                    top: 90,
                },
                {
                    ...calendarTemplate,
                    top: 340,
                },
            ],
            color: GraphUtils.getDefaultColorPalette(),
        };
    }

    private formatYAxisLabel(
        amount: string,
        currencyId: number,
        currencyMap: Map<number, CashCurrency>,
    ): string {
        return PrintUtils.printAmount(amount, currencyId, currencyMap, 0);
    }

    private formatLegend(
        legendKey: string,
        accountMap: Map<number, CashAccount>,
        merged: boolean = false,
    ): string {
        if (merged) {
            return 'merged';
        }
        const keyObj = CashAccountUtils.extractKey(legendKey);
        const account: CashAccount = accountMap.get(+keyObj.accountId)!;
        return account.name;
    }

    private formatTooltip(
        params: object | any[],
        accountMap: Map<number, CashAccount>,
        currencyMap: Map<number, CashCurrency>,
        useOriginalCurrency: boolean = false,
        merged: boolean = false,
    ): string {
        const amountField = useOriginalCurrency ? 'originalAmount' : 'amount';
        const currencyField = useOriginalCurrency ? 'originalCurrencyId' : 'currencyId';
        let output: string = '';
        if (Array.isArray(params)) {
            for (const param of params) {
                const item: GraphSplit = param.data;
                const account: CashAccount = accountMap.get(+item.accountId)!;
                const accountName = merged ? '' : account.name;
                const amountString = PrintUtils.printAmount(
                    '' + item[amountField],
                    +item[currencyField],
                    currencyMap,
                );
                const dateString = DateUtils.formatHumanDate(item.transactionDate);
                const dateStringWithUpperCase = StringUtils.toUpperCaseFirstLetter(dateString);
                output += `${dateStringWithUpperCase} : ${StringUtils.escapeHtml(
                    accountName,
                )} ${amountString}<br/>`;
            }
        }
        return output;
    }

    private formatExternalTooltip(
        params: object | any[],
        accountMap: Map<number, CashAccount>,
        currencyMap: Map<number, CashCurrency>,
        useOriginalCurrency: boolean = false,
        merged: boolean = false,
    ): string {
        const amountField = useOriginalCurrency ? 'originalAmount' : 'amount';
        const currencyField = useOriginalCurrency ? 'originalCurrencyId' : 'currencyId';
        let output: string = '';
        if (Array.isArray(params)) {
            if (params.length > 0) {
                const dateParsed = parse(
                    params[0].data.transactionDate,
                    'yyyy-MM',
                    DateUtils.newDate(),
                );
                const dateString = DateUtils.formatHumanMonth(dateParsed);
                const dateStringWithUpperCase = StringUtils.toUpperCaseFirstLetter(dateString);
                output += `<strong>${dateStringWithUpperCase}</strong> : <br/>`;
            }
            for (const param of params.sort((a, b) => b.data[amountField] - a.data[amountField])) {
                const item: GraphSplit = param.data;
                if (item[amountField] !== 0) {
                    const account: CashAccount = accountMap.get(+item.accountId)!;
                    const accountName = merged ? '' : account.name;
                    const amountString = PrintUtils.printAmount(
                        '' + item[amountField],
                        +item[currencyField],
                        currencyMap,
                    );
                    output += `${param.marker} ${StringUtils.escapeHtml(
                        accountName,
                    )} ${amountString}<br/>`;
                }
            }
        }
        return output;
    }

    private formatInOutTooltip(
        params: object | any[],
        accountMap: Map<number, CashAccount>,
        currencyMap: Map<number, CashCurrency>,
        useOriginalCurrency: boolean = false,
        merged: boolean = false,
    ): string {
        const amountField = useOriginalCurrency ? 'originalAmount' : 'amount';
        const currencyField = useOriginalCurrency ? 'originalCurrencyId' : 'currencyId';
        let output: string = '';
        if (Array.isArray(params)) {
            if (params.length > 0) {
                const dateParsed = parse(
                    params[0].data.transactionDate,
                    'yyyy-MM',
                    DateUtils.newDate(),
                );
                const dateString = DateUtils.formatHumanMonth(dateParsed);
                const dateStringWithUpperCase = StringUtils.toUpperCaseFirstLetter(dateString);
                output += `<strong>${dateStringWithUpperCase}</strong> : <br/>`;
            }
            let deltaAmount = 0;
            let deltaCurrencyId = 0;
            for (const param of params) {
                const item: GraphSplit = param.data;
                const accountName = param.seriesName;
                const amountString = PrintUtils.printAmount(
                    '' + item[amountField],
                    +item[currencyField],
                    currencyMap,
                );
                if (accountName === InOutType.IN) {
                    deltaAmount += item[amountField];
                } else {
                    deltaAmount -= item[amountField];
                }
                deltaCurrencyId = item[currencyField];
                // tslint:disable-next-line:max-line-length
                output += `${param.marker} ${StringUtils.escapeHtml(
                    i18n.t(accountName).toString(),
                )} ${amountString}<br/>`;
            }
            const deltaString = PrintUtils.printAmount(
                '' + deltaAmount,
                +deltaCurrencyId,
                currencyMap,
            );
            output += `Delta ${deltaString}<br/>`;
        }
        return output;
    }

    private formatPieTooltip(
        params: any,
        accountMap: Map<number, CashAccount>,
        currencyMap: Map<number, CashCurrency>,
    ): string {
        const data = params.data;
        const percent = params.percent;
        const output = `${StringUtils.escapeHtml(data.name)} (${percent}%)<br/>`;
        return output;
    }

    private formatBudgetTooltip(
        params: any,
        accountMap: Map<number, CashAccount>,
        currencyMap: Map<number, CashCurrency>,
        currency: CashCurrency,
    ): string {
        const title = i18n.t(params[0].axisValueLabel);
        let output: string = `<strong>${title}:</strong><br/>`;
        for (const param of params) {
            const accountName = param.seriesName;
            const amountString = PrintUtils.printAmount(
                '' + param.data.amount,
                +currency.id,
                currencyMap,
            );
            // tslint:disable-next-line:max-line-length
            output += `<strong>${param.marker} ${StringUtils.escapeHtml(
                accountName,
            )}</strong> ${amountString}<br/>`;
        }
        return output;
    }

    private formatTopBarLabel(
        params: any,
        accountMap: Map<number, CashAccount>,
        currencyMap: Map<number, CashCurrency>,
    ): string {
        const data = params.data;
        const amount = PrintUtils.printAmount(data.amount, +data.currencyId, currencyMap);
        const amoutWithSign = data.amount >= 0 ? `+${amount}` : amount;
        const output = `${data.name}: ${amoutWithSign}`;
        return output;
    }

    private formatTopBarTooltip(
        params: any,
        accountMap: Map<number, CashAccount>,
        currencyMap: Map<number, CashCurrency>,
    ): string {
        const data = params['0'].data;
        const amount = PrintUtils.printAmount(data.amount, +data.currencyId, currencyMap);
        const amoutWithSign = data.amount >= 0 ? `+${amount}` : amount;
        const output = `${data.name}: ${amoutWithSign}`;
        return output;
    }
}
