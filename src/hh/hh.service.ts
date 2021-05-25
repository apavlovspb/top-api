import { HttpService, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HhData } from 'src/top-page/top-page.model';
import { API_URL, SALARYCLUSTER_ID, CLUSTER_FIND_ERROR } from './hh.constants';
import { HhResponse } from './hh.models';

@Injectable()
export class HhService {
  token: string;
  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.token = this.configService.get('HH_TOKEN') ?? '';
  }

  async getData(text: string) {
    try {
      const { data } = await this.httpService
        .get<HhResponse>(API_URL.vacancies, {
          params: { text, clusters: true },
          headers: { 'User-Agent': 'PostmanRuntime/7.26.8' },
        })
        .toPromise();

      return { ...this.parseData(data), categories: text };
    } catch (e) {
      Logger.error(e);
    }
  }

  private parseData(data: HhResponse): HhData {
    const salaryCluster = data.clusters.find((c) => c.id === SALARYCLUSTER_ID);
    if (!salaryCluster) {
      throw new Error(CLUSTER_FIND_ERROR);
    }
    const juniorSalary = this.getSalaryFromString(salaryCluster.items[1].name);
    const middleSalary = this.getSalaryFromString(
      salaryCluster.items[Math.ceil(salaryCluster.items.length / 2)].name,
    );
    const seniorSalary = this.getSalaryFromString(
      salaryCluster.items[salaryCluster.items.length - 1].name,
    );
    return {
      count: data.found,
      juniorSalary,
      middleSalary,
      seniorSalary,
      updatedAt: new Date(),
    };
  }

  private getSalaryFromString(str: string): number {
    const numberRegExp = /(\d+)/g;
    const res = str.match(numberRegExp);
    if (!res) {
      return 0;
    }
    return Number(res[0]);
  }
}
