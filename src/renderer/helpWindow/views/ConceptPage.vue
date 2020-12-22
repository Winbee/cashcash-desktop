<template>
    <div class="wrapper">
        <div class="header">
            <el-button
                class="back-button"
                type="primary"
                icon="el-icon-arrow-left"
                @click="goto('home-page')"
            ></el-button>
            <h2>{{ $t('Key concepts') }}</h2>
        </div>

        <div class="main-block">
            <h2>{{ $t('Accounts') }}</h2>

            <p>{{ $t('documentation.concept.1') }}</p>
            <p>{{ $t('documentation.concept.2') }}</p>
            <ul>
                <li>{{ $t('documentation.concept.3') }}</li>
                <li>{{ $t('documentation.concept.4') }}</li>
                <li>{{ $t('documentation.concept.5') }}</li>
                <li>{{ $t('documentation.concept.6') }}</li>
                <li>{{ $t('documentation.concept.7') }}</li>
            </ul>

            <img src="@/renderer/common/assets/account-schema.png" />

            <p>{{ $t('documentation.concept.8') }}</p>

            <p>{{ $t('documentation.concept.9') }}</p>

            <p>{{ $t('documentation.concept.10') }}</p>

            <h2>{{ $t('Transactions') }}</h2>
            <p>{{ $t('documentation.concept.11') }}</p>

            <p>{{ $t('documentation.concept.12') }}</p>

            <p>{{ $t('documentation.concept.13') }}</p>

            <img src="@/renderer/common/assets/transaction-schema.png" />

            <p>{{ $t('documentation.concept.14') }}</p>

            <h2>{{ $t('Currencies') }}</h2>
            <p>{{ $t('documentation.concept.15') }}</p>
            <ul>
                <li>United States dollar ($)</li>
                <li>Euro (€)</li>
                <li>Australian dollar (A$)</li>
                <li>Bulgarian lev (лв)</li>
                <li>Brazilian real (R$)</li>
                <li>Canadian dollar (C$)</li>
                <li>Swiss franc (Fr)</li>
                <li>Renminbi (元)</li>
                <li>Czech koruna (Kč)</li>
                <li>Danish krone (kr)</li>
                <li>Pound sterling (£)</li>
                <li>Hong Kong dollar (HK$)</li>
                <li>Croatian kuna (Kn)</li>
                <li>Hungarian forint (Ft)</li>
                <li>Indonesian rupiah (Rp)</li>
                <li>Israeli new shekel (₪)</li>
                <li>Indian rupee (₹)</li>
                <li>Icelandic króna (Íkr)</li>
                <li>Japanese yen (¥)</li>
                <li>South Korean won (₩)</li>
                <li>Mexican peso (Mex$)</li>
                <li>Malaysian ringgit (Rm)</li>
                <li>Norwegian krone (Kr)</li>
                <li>New Zealand dollar (NZ$)</li>
                <li>Philippine peso (₱)</li>
                <li>Polish złoty (zł)</li>
                <li>Romanian leu (lei)</li>
                <li>Russian ruble (₽)</li>
                <li>Swedish krona (kr)</li>
                <li>Singapore dollar (S$)</li>
                <li>Thai baht (฿)</li>
                <li>Turkish lira (₺)</li>
                <li>South African rand (R)</li>
            </ul>
            <p>{{ $t('documentation.concept.16') }}</p>

            <h2>{{ $t('Filters') }}</h2>
            <p>{{ $t('documentation.concept.17') }}</p>

            <h2>{{ $t('Rules') }}</h2>
            <p>{{ $t('documentation.concept.18') }}</p>
            <p>{{ $t('documentation.concept.19') }}</p>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';

export default Vue.extend({
    components: {},
    data() {
        return {};
    },
    methods: {
        goto(this: any, name: string) {
            this.$router.push({ name });
        },
    },
});
</script>

<style lang="scss" scoped>
.header {
    display: flex;
    .back-button {
        padding: 10px;
        margin: 15px;
    }
}
.main-block {
    padding: 10px 15px;
}

img {
    width: 100%;
}
</style>
