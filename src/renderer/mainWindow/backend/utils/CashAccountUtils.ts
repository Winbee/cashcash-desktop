import _ from 'lodash';
import CashAccount from '../database/entity/CashAccount';
import CashAccountType from '../database/entity/enumeration/CashAccountType';
import { AccountCurrencyKey } from '../database/entity/proxy/CashKey';
import { TransactionParameters } from '../service/dto/Parameters';

export default class CashAccountUtils {
    static contains(accountList: CashAccount[], accountToCheck: CashAccount): boolean {
        if (!accountList || !accountToCheck) {
            return false;
        }
        for (const account of accountList) {
            if (
                account.id === accountToCheck.id ||
                CashAccountUtils.contains(account.children, accountToCheck)
            ) {
                return true;
            }
        }
        return false;
    }

    static generateKey(accountId: number, currencyId: number): AccountCurrencyKey {
        return accountId.toString() + ':' + currencyId.toString();
    }

    static extractKey(key: AccountCurrencyKey): { accountId: number; currencyId: number } {
        const idList = key.split(':');
        return {
            accountId: +idList[0],
            currencyId: +idList[1],
        };
    }

    static extractAccountAndSubAccounts(
        accountMap: Map<number, CashAccount>,
        parentAccountId: number,
    ): number[] {
        const subAccountIdList = CashAccountUtils.extractSubAccounts(accountMap, parentAccountId);
        subAccountIdList.push(parentAccountId);
        return subAccountIdList;
    }

    static extractSubAccounts(
        accountMap: Map<number, CashAccount>,
        parentAccountId: number,
    ): number[] {
        const subAccountIdList: number[] = [];
        const parentAccount = accountMap.get(parentAccountId)!;
        if (parentAccount.children) {
            for (const account of parentAccount.children) {
                subAccountIdList.push(account.id);
                if (account.children) {
                    subAccountIdList.push(
                        ...CashAccountUtils.extractSubAccounts(accountMap, account.id),
                    );
                }
            }
        }
        return subAccountIdList;
    }

    static extractLeafAccounts(
        accountMap: Map<number, CashAccount>,
        parentAccountId: number,
    ): number[] {
        const leafAccountIdList: number[] = [];
        const parentAccount = accountMap.get(parentAccountId)!;
        if (parentAccount.isDirectory) {
            if (parentAccount.children) {
                for (const account of parentAccount.children) {
                    leafAccountIdList.push(
                        ...CashAccountUtils.extractLeafAccounts(accountMap, account.id),
                    );
                }
            }
        } else {
            leafAccountIdList.push(parentAccount.id);
        }
        return leafAccountIdList;
    }

    static adaptAccountParamForLeafAccounts(
        parameters: TransactionParameters,
        accountMap: Map<number, CashAccount>,
    ): TransactionParameters {
        const newParameter = {
            ...parameters,
        };
        if (parameters.accountIdList.length === 1) {
            const account = accountMap.get(parameters.accountIdList[0]);
            if (account && account.isDirectory) {
                const leafIdList = CashAccountUtils.extractLeafAccounts(accountMap, account.id);
                newParameter.accountIdList = leafIdList;
            }
        }
        if (parameters.fromAccountIdList.length === 1) {
            const account = accountMap.get(parameters.fromAccountIdList[0]);
            if (account && account.isDirectory) {
                const leafIdList = CashAccountUtils.extractLeafAccounts(accountMap, account.id);
                newParameter.fromAccountIdList = leafIdList;
            }
        }
        if (parameters.toAccountIdList.length === 1) {
            const account = accountMap.get(parameters.toAccountIdList[0]);
            if (account && account.isDirectory) {
                const leafIdList = CashAccountUtils.extractLeafAccounts(accountMap, account.id);
                newParameter.toAccountIdList = leafIdList;
            }
        }
        return newParameter;
    }

    static isLeaf(account: CashAccount): boolean {
        return !account.isDirectory;
    }

    static findByName(
        cashAccountList: CashAccount[],
        nameAccount: string,
    ): CashAccount | undefined {
        return _.find(cashAccountList, { name: nameAccount });
    }

    static findById(cashAccountList: CashAccount[], id: number): CashAccount | undefined {
        return _.first(_.filter(cashAccountList, { id }));
    }

    static listToTreeAndMap(
        flatData: CashAccount[],
        primaryKey = 'id',
        parentKey = 'parentAccountId',
    ): {
        accountTree: CashAccount[];
        accountMap: Map<number, CashAccount>;
        accountDescendantMap: Map<number, number[]>;
    } {
        // create a primaryKey: node map
        const accountMap = this.listToMapById(flatData, primaryKey);

        // create the tree array
        const accountTree: CashAccount[] = [];
        accountMap.forEach((node) => {
            // add to parent
            const parent = accountMap.get(node[parentKey]);
            if (parent) {
                // create child array if it doesn't exist
                if (!parent.children) {
                    parent.children = [];
                }
                // add node to child array
                parent.children.push(node);
                node.parentAccount = parent;
            } else {
                // parent is null or missing
                accountTree.push(node);
            }
        });
        const accountDescendantMap = new Map();
        CashAccountUtils.createDescendantMapAndUpdateLevel(accountTree, accountDescendantMap);
        return { accountTree, accountMap, accountDescendantMap };
    }

    static createDescendantMapAndUpdateLevel(
        accountTree: CashAccount[],
        accountDescendantMap: Map<number, number[]>,
        parentLevel: number = -1,
    ): number[] {
        const descendantIdList: number[] = [];
        for (const account of accountTree) {
            account.level = parentLevel + 1;
            descendantIdList.push(account.id);
            const childrenDescendantIdList: number[] = [];
            if (account.children) {
                childrenDescendantIdList.push(
                    ...CashAccountUtils.createDescendantMapAndUpdateLevel(
                        account.children,
                        accountDescendantMap,
                        account.level,
                    ),
                );
            }
            descendantIdList.push(...childrenDescendantIdList);
            accountDescendantMap.set(account.id, childrenDescendantIdList);
        }
        return descendantIdList;
    }

    static listToMapById(flatData: CashAccount[], primaryKey = 'id'): Map<number, CashAccount> {
        return new Map(flatData.map((account) => [account[primaryKey], account]) as any);
    }

    static isExternal(account: CashAccount) {
        return account.type === CashAccountType.INCOME || account.type === CashAccountType.EXPENSE;
    }

    static isInternal(account: CashAccount) {
        return !CashAccountUtils.isExternal(account);
    }

    static filter(
        treeList: CashAccount[],
        filterNodeMethod: (node: CashAccount) => boolean,
    ): CashAccount[] {
        const newTreeList: any = [];

        treeList.forEach((item) => {
            if (!item.children || item.children.length === 0) {
                // leaf
                if (filterNodeMethod(item)) {
                    newTreeList.push(_.clone(item));
                }
            } else {
                const newChildrenTreeList = CashAccountUtils.filter(
                    item.children,
                    filterNodeMethod,
                );
                if (newChildrenTreeList.length > 0 || filterNodeMethod(item)) {
                    const clone = _.clone(item);
                    clone.children = newChildrenTreeList;
                    newTreeList.push(clone);
                }
            }
        });

        return newTreeList;
    }

    static getAccountParent(
        accountId: number,
        accountMap: Map<number, CashAccount>,
        level: number,
    ): CashAccount {
        let currentAccount = accountMap.get(accountId);
        if (currentAccount === undefined) {
            throw new Error('Account not found');
        }
        while (currentAccount.level > level && currentAccount.parentAccount) {
            if (currentAccount.parentAccount) {
                currentAccount = currentAccount.parentAccount;
            }
        }
        return currentAccount;
    }
}
