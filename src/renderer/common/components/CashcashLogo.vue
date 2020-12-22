<template>
    <div>
        <svg class="cashcash-logo">
            <defs id="defs1042">
                <linearGradient id="linearGradient841" inkscape:collect="always">
                    <stop id="stop845" offset="0" style="stop-color: #717bfd; stop-opacity: 1" />
                    <stop id="stop847" offset="1" style="stop-color: #4b5aba; stop-opacity: 1" />
                </linearGradient>
                <linearGradient
                    inkscape:collect="always"
                    xlink:href="#linearGradient841"
                    id="linearGradient843"
                    x1="250"
                    y1="40"
                    x2="180"
                    y2="350"
                    gradientUnits="userSpaceOnUse"
                />
                <linearGradient id="linearGradient1051" inkscape:collect="always">
                    <stop id="stop1047" offset="0" style="stop-color: #ffea2c; stop-opacity: 1" />
                    <stop id="stop1049" offset="1" style="stop-color: #f19b20; stop-opacity: 1" />
                </linearGradient>
                <linearGradient
                    gradientUnits="userSpaceOnUse"
                    x1="250"
                    y1="40"
                    x2="180"
                    y2="250"
                    id="linearGradient1053"
                    xlink:href="#linearGradient1051"
                    inkscape:collect="always"
                />
                <filter
                    style="color-interpolation-filters: sRGB"
                    inkscape:label="Outer Drop Shadow"
                    id="filter1280"
                >
                    <feFlood
                        flood-opacity="0.498039"
                        flood-color="rgb(0,0,0)"
                        result="flood"
                        id="feFlood1270"
                    />
                    <feComposite
                        in="flood"
                        in2="SourceGraphic"
                        operator="in"
                        result="composite1"
                        id="feComposite1272"
                    />
                    <feGaussianBlur
                        in="composite1"
                        stdDeviation="6"
                        result="blur"
                        id="feGaussianBlur1274"
                    />
                    <feOffset dx="-8" dy="10" result="offset" id="feOffset1276" />
                    <feComposite
                        in="SourceGraphic"
                        in2="offset"
                        operator="over"
                        result="composite2"
                        id="feComposite1278"
                    />
                </filter>
                <filter
                    style="color-interpolation-filters: sRGB"
                    inkscape:label="Inner Drop Shadow"
                    id="filter3082"
                >
                    <feFlood
                        flood-opacity="0.498039"
                        flood-color="rgb(0,0,0)"
                        result="flood"
                        id="feFlood3072"
                    />
                    <feComposite
                        in="flood"
                        in2="SourceGraphic"
                        operator="out"
                        result="composite1"
                        id="feComposite3074"
                    />
                    <feGaussianBlur
                        in="composite1"
                        stdDeviation="6"
                        result="blur"
                        id="feGaussianBlur3076"
                    />
                    <feOffset dx="-8" dy="10" result="offset" id="feOffset3078" />
                    <feComposite
                        in="offset"
                        in2="SourceGraphic"
                        operator="atop"
                        result="composite2"
                        id="feComposite3080"
                    />
                </filter>
            </defs>
        </svg>
    </div>
</template>

<script lang="ts">
import * as d3 from 'd3';

export default {
    name: 'cashcash-logo',
    props: {},
    methods: {
        generateSliceValue(n: number, sameSize = false): { key: string; value: number }[] {
            const data: { key: string; value: number }[] = [];
            // if n
            // min + 2min + 2*2min + ... + 2^n*min = 360
            // (1 + 2 + 2*2 + ... + 2^n)*min = 360
            // (n + 1)*(1 + 2^n)/2*min = 360
            // min = 360 / ((n + 1)*(1 + 2^n)/2)

            let previousValue: number = 0;
            if (sameSize) {
                const size = 360 / n;
                for (const i in [...Array(n).keys()]) {
                    if (i) {
                        data.push({ key: i, value: size });
                    }
                }
            } else {
                for (const i in [...Array(n).keys()]) {
                    if (i) {
                        if (previousValue !== 0) {
                            previousValue = (previousValue * 120) / 100;
                        } else {
                            previousValue = 360 / (((n + 1) * Math.pow(1 + 120 / 100, n)) / 2);
                        }
                        data.push({ key: i, value: previousValue });
                    }
                }
            }

            return data;
        },
    },
    mounted(this: any) {
        const toRadians = (degrees) => {
            return (degrees * Math.PI) / 180;
        };

        // set the dimensions and margins of the graph
        const width = 450;
        const height = 450;
        const margin = 60;
        const totalOfSlices = 9;
        const finalAngle = 63;

        // The radius of the pieplot is half the width or half the height (smallest one). I subtract a bit of margin.
        const radius = Math.min(width, height) / 2 - margin;

        // append the svg object to the div called 'my_dataviz'
        const svg = d3.select('.cashcash-logo').attr('width', width).attr('height', height);

        const defs = svg.select('defs');

        const back = svg
            .append('rect')
            .attr('width', width)
            .attr('height', height)
            .attr('class', 'logo-background');

        const centeredG = svg
            .append('g')
            .attr('class', 'center-g')
            .attr('transform', 'translate(' + width / 2 + ',' + height / 2 + ')');

        // Create dummy data
        const data = this.generateSliceValue(totalOfSlices);

        const scale = (d3 as any).schemeTableau10;
        scale.shift();
        const color = d3
            .scaleSequential(d3.interpolateRdYlGn)
            // .scaleOrdinal(scale)
            .domain(data.map((d) => d.key) as any);

        // Compute the position of each group on the pie:
        const pieGenerator = d3
            .pie()
            .value((d: any) => {
                return d.value;
            })
            .startAngle(toRadians(finalAngle))
            .endAngle(toRadians(360 + finalAngle));
        const dataReady = pieGenerator(data as any);

        const pieArc = d3.arc().innerRadius(0).outerRadius(radius);
        const externalArc = d3.arc().innerRadius(0).outerRadius(90);
        // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
        centeredG
            .selectAll('whatever')
            .data(dataReady)
            .enter()
            .append('path')
            .attr('d', pieArc as any)
            .attr('class', 'pie-slice')
            .attr('fill', (d, i) => color(i / totalOfSlices)  || '#ffff');

        const mask = defs.append('mask').attr('id', 'dollar-mask');
        mask.append('rect')
            .attr('class', 'rect-mask')
            .attr('x', -width / 2)
            .attr('y', -height / 2)
            .attr('width', width)
            .attr('height', height);

        const dollarText = centeredG
            .append('text')
            .text('$')
            .attr('class', 'dollar-text')
            .attr('dy', 6);

        // Animation
        const dollarColor = '#717bfd';
        centeredG
            .selectAll('.pie-slice')
            .transition()
            .delay((d, i) => {
                return i * 100;
            })
            .duration(400)
            .ease(d3.easeQuadInOut)
            .on('start', function repeat() {
                d3.active(this)!
                    .attr('transform', (d: any, i) => {
                        const arc = d3
                            .arc()
                            .innerRadius(0)
                            .outerRadius((totalOfSlices - d.data.key) * 10);
                        const move = arc.centroid(d);
                        return `translate(${move})`;
                    })
                    .styleTween('fill', (d: any, i) => {
                        if (+d.data.key === 8) {
                            dollarText
                                .transition()
                                .duration(500)
                                .styleTween('fill', () => {
                                    return d3.interpolateRgb('white', dollarColor);
                                });
                        }
                        const dataColor = color(d.data.key / totalOfSlices) || '#ffff';
                        return d3.interpolateRgb(dataColor, '#ffea2cff');
                    })
                    .transition()
                    .attr('transform', (d, i) => {
                        return `translate(0,0)`;
                    })
                    .transition()
                    .delay(1000)
                    .attr('transform', (d: any, i) => {
                        const arc = d3
                            .arc()
                            .innerRadius(0)
                            .outerRadius((totalOfSlices - d.data.key) * 10);
                        const move = arc.centroid(d);
                        return `translate(${move})`;
                    })
                    .styleTween('fill', (d: any, i) => {
                        if (+d.data.key === 8) {
                            dollarText
                                .transition()
                                .duration(500)
                                .styleTween('fill', () => {
                                    return d3.interpolateRgb(dollarColor, 'white');
                                });
                        }
                        const dataColor = color(d.data.key / totalOfSlices) || '#ffff';
                        return d3.interpolateRgb('#ffea2cff', dataColor);
                    })
                    .transition()
                    .attr('transform', (d, i) => {
                        return `translate(0,0)`;
                    })
                    .transition()
                    .delay(1000)
                    .on('start', repeat);
            });
    },
};
</script>

<style lang="scss">
.rect-mask {
    fill: white;
}

.dollar-text {
    text-anchor: middle;
    alignment-baseline: middle;
    font-size: 290px;
    font-family: 'Tahoma';
    fill: #717bfd;
}

.logo-background {
    fill: url('#linearGradient843');
    // fill: white;
    rx: 50;
    ry: 50;
}

.center-g {
    mask: url(#dollar-mask);
}
</style>
