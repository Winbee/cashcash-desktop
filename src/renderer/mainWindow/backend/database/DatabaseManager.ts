import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { Connection } from 'typeorm/connection/Connection';
import { SqliteConnectionOptions } from 'typeorm/driver/sqlite/SqliteConnectionOptions';
import CashAccount from './entity/CashAccount';
import CashBankInfo from './entity/CashBankInfo';
import CashCurrency from './entity/CashCurrency';
import CashRate from './entity/CashRate';
import CashSplit from './entity/CashSplit';
import CashSplitSum from './entity/CashSplitSum';
import CashTransaction from './entity/CashTransaction';
import CashImportConfig from './entity/CashImportConfig';
import InitDatabase1535400915273 from '../../../../migration/1535400915273-init_database';
import electron, { ipcRenderer } from 'electron';
import AddTransaction1535400915274 from '../../../../migration/1535400915274-add_transaction_type';
import CashTransactionIndex from './entity/CashTransactionIndex';
import CashTransactionTempIndex from './entity/CashTransactionTempIndex';
import AddRule1535400915276 from '../../../../migration/1535400915276-add_rule';
import AddBudget1535400915277 from '../../../../migration/1535400915277-add_budget';
import AddIsMultiCurrency1535400915278 from '../../../../migration/1535400915278-add_isMultiCurrency';
import CashRule from './entity/CashRule';
import CashTag from './entity/CashTag';
import { Service } from 'typedi';
import CashPreferences from './entity/CashPreferences';
import AddTransactionTypeInSplit1535400915279 from '../../../../migration/1535400915279-add_transaction_type_in_split';
import AddPreferences1535400915280 from '../../../../migration/1535400915280-add_preferences';
import RefactorRule1535400915281 from '../../../../migration/1535400915281-refactor_rule';
import CashFilter from './entity/CashFilter';
import CashAction from './entity/CashAction';
import DuplicateAll1535400915282 from '../../../../migration/1535400915282-duplicate_all';
import AddFullSearch1535400915284 from '../../../../migration/1535400915284-add_full_search_table';
import AddTempFullSearch1535400915285 from '../../../../migration/1535400915285-add_temp_full_search_table';
import FixFullSearch1535400915286 from '../../../../migration/1535400915286-fix_full_search_update_trigger';
import FixFullSearchInsert1535400915288 from '../../../../migration/1535400915288-fix_full_search_insert_trigger';
import AddBudgetTransaction1535400915289 from '../../../../migration/1535400915289-add_budget_transaction';
import AddUuid1535400915290 from '../../../../migration/1535400915290-add_uuid';
import UpdateEquity1535400915291 from '../../../../migration/1535400915291-update_equity';
import AddTag1535400915292 from '../../../../migration/1535400915292-add_tag';
import CashError from '../service/dto/CashError';
import CashBudgetSplit from './entity/CashBudgetSplit';
import CashBudgetTransaction from './entity/CashBudgetTransaction';

const isProdEnv = process.env.NODE_ENV === 'production';

@Service()
export class DatabaseManager {
    databasePath: string = isProdEnv
        ? electron.remote.app.getPath('userData') + '/cashcash_db.sqlite'
        : electron.remote.app.getPath('documents') + '/cashcash_dev_db.sqlite';
    connection: Connection;

    async getConnection(): Promise<Connection> {
        if (!this.connection) {
            await this.initConnection();
        }
        return this.connection;
    }

    async downloadDatabaseFile() {
        await this.resetConnection();
        ipcRenderer.send('downloadDatabase', {
            url: 'file://' + this.databasePath,
        });
    }

    async deleteDatabase() {
        await this.resetConnection();
        ipcRenderer.send('deleteDatabase', {
            databasePath: this.databasePath,
        });
    }

    async importDatabaseFile(file: File) {
        await this.resetConnection();
        const path = file.path || (file as any).raw.path;
        if (path === this.databasePath) {
            throw new CashError("Can't import the same database file.");
        }
        ipcRenderer.send('importDatabase', {
            newFilePath: path,
            databasePath: this.databasePath,
        });
    }

    async resetConnection() {
        if (this.connection) {
            await this.connection.close();
            await this.connection.connect();
        }
    }

    async initConnection() {
        const config: SqliteConnectionOptions = {
            type: 'sqlite',
            database: this.databasePath,
            logging: !isProdEnv && false,
            synchronize: !isProdEnv && false,
            dropSchema: !isProdEnv && false,
            migrationsRun: true,
            logger: 'simple-console',
            entities: [
                CashAccount,
                CashBankInfo,
                CashCurrency,
                CashImportConfig,
                CashRate,
                CashSplit,
                CashSplitSum,
                CashTransaction,
                CashTransactionIndex,
                CashTransactionTempIndex,
                CashRule,
                CashPreferences,
                CashFilter,
                CashAction,
                CashBudgetSplit,
                CashBudgetTransaction,
                CashTag,
            ],
            migrations: [
                InitDatabase1535400915273,
                AddTransaction1535400915274,
                AddRule1535400915276,
                AddBudget1535400915277,
                AddIsMultiCurrency1535400915278,
                AddTransactionTypeInSplit1535400915279,
                AddPreferences1535400915280,
                RefactorRule1535400915281,
                DuplicateAll1535400915282,
                AddFullSearch1535400915284,
                AddTempFullSearch1535400915285,
                FixFullSearch1535400915286,
                FixFullSearchInsert1535400915288,
                AddBudgetTransaction1535400915289,
                AddUuid1535400915290,
                UpdateEquity1535400915291,
                AddTag1535400915292,
            ],
        };
        this.connection = await createConnection(config);
    }
}
