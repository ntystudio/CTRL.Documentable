// DataService.ts
import {ClassConfig, ObjectConfig} from '../types/types';
import jsonData from '../data/nodes.json';

class DataService {
    private dataCache: ClassConfig = jsonData;

    async loadData(): Promise<ClassConfig> {
        return this.dataCache;
    }
}

export const dataService = new DataService();
