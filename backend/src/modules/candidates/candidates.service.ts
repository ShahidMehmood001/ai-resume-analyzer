import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, ILike } from "typeorm";
import { Candidate, CandidateStatus } from "./entities/candidate.entity";
import { QueryCandidatesDto } from "./dto/query-candidates.dto";
import { UpdateCandidateDto } from "./dto/update-candidate.dto";

@Injectable()
export class CandidatesService {
  constructor(@InjectRepository(Candidate) private repo: Repository<Candidate>) {}

  async findAll(query: QueryCandidatesDto) {
    const page = parseInt(query.page ?? "1");
    const limit = parseInt(query.limit ?? "10");
    const skip = (page - 1) * limit;
    const order = query.order ?? "DESC";
    const sortBy = query.sortBy ?? "createdAt";

    const qb = this.repo.createQueryBuilder("c").leftJoinAndSelect("c.resumes", "r");

    if (query.search) {
      qb.andWhere(
        "(c.name ILIKE :search OR c.email ILIKE :search OR c.city ILIKE :search)",
        { search: `%${query.search}%` },
      );
    }
    if (query.status) qb.andWhere("c.status = :status", { status: query.status });
    if (query.skill) qb.andWhere(":skill = ANY(c.skills)", { skill: query.skill });

    qb.orderBy(`c.${sortBy}`, order as "ASC" | "DESC").skip(skip).take(limit);

    const [data, total] = await qb.getManyAndCount();
    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string): Promise<Candidate> {
    const c = await this.repo.findOne({ where: { id }, relations: ["resumes", "resumes.scores"] });
    if (!c) throw new NotFoundException(`Candidate ${id} not found`);
    return c;
  }

  async update(id: string, dto: UpdateCandidateDto): Promise<Candidate> {
    const candidate = await this.findOne(id);
    Object.assign(candidate, dto);
    return this.repo.save(candidate);
  }

  async remove(id: string): Promise<void> {
    const candidate = await this.findOne(id);
    await this.repo.remove(candidate);
  }

  async compareMultiple(ids: string[]): Promise<Candidate[]> {
    return Promise.all(ids.map((id) => this.findOne(id)));
  }
}
