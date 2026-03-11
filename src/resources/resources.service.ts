import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Resource, ResourceDocument } from './schemas/resource.schema';
import { CreateResourceDto } from './dto/create-resource.dto';
import { UpdateResourceDto } from './dto/update-resource.dto';

@Injectable()
export class ResourcesService {
    constructor(
        @InjectModel(Resource.name) private resourceModel: Model<ResourceDocument>,
    ) { }

    async create(dto: CreateResourceDto, files?: { thumbnail?: Express.Multer.File[], resourceFile?: Express.Multer.File[] }) {
        if (files) {
            if (files.thumbnail?.[0]) {
                dto.thumbnailUrl = `/uploads/resources/${files.thumbnail[0].filename}`;
            }
            if (files.resourceFile?.[0]) {
                dto.downloadUrl = `/uploads/resources/${files.resourceFile[0].filename}`;
            }
        }
        const created = new this.resourceModel(dto);
        return created.save();
    }

    async findAllAdmin() {
        return this.resourceModel.find().sort({ createdAt: -1 }).exec();
    }

    async findAllPublished(query: any) {
        const { page = 1, limit = 12, category, type, search, sort, difficulty } = query;
        const skip = (Number(page) - 1) * Number(limit);

        const filter: any = { status: 'published' };

        if (category && category !== 'All') filter.category = category;
        if (type && type !== 'All') filter.type = type;
        if (difficulty && difficulty !== 'All') filter.difficulty = difficulty;

        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { tags: { $in: [new RegExp(search, 'i')] } },
            ];
        }

        let sortOption: any = { createdAt: -1 };
        if (sort === 'popular') sortOption = { downloads: -1, students: -1 };
        if (sort === 'rating') sortOption = { rating: -1 };
        if (sort === 'alphabetical') sortOption = { title: 1 };
        if (sort === 'recent') sortOption = { createdAt: -1 };

        const [data, total] = await Promise.all([
            this.resourceModel.find(filter).sort(sortOption).skip(skip).limit(Number(limit)).exec(),
            this.resourceModel.countDocuments(filter).exec()
        ]);

        return {
            data,
            total,
            page: Number(page),
            totalPages: Math.ceil(total / Number(limit)) || 1,
        };
    }

    async findOne(id: string) {
        const resource = await this.resourceModel.findById(id).exec();
        if (!resource) throw new NotFoundException('Resource not found');
        return resource;
    }

    async update(id: string, dto: UpdateResourceDto, files?: { thumbnail?: Express.Multer.File[], resourceFile?: Express.Multer.File[] }) {
        if (files) {
            if (files.thumbnail?.[0]) {
                dto.thumbnailUrl = `/uploads/resources/${files.thumbnail[0].filename}`;
            }
            if (files.resourceFile?.[0]) {
                dto.downloadUrl = `/uploads/resources/${files.resourceFile[0].filename}`;
            }
        }
        const updated = await this.resourceModel
            .findByIdAndUpdate(id, dto, { new: true })
            .exec();
        if (!updated) throw new NotFoundException('Resource not found');
        return updated;
    }

    async remove(id: string) {
        const res = await this.resourceModel.findByIdAndDelete(id).exec();
        if (!res) throw new NotFoundException('Resource not found');
        return { deleted: true };
    }

    async incrementDownloads(id: string) {
        const res = await this.resourceModel.findByIdAndUpdate(id, { $inc: { downloads: 1 } }, { new: true }).exec();
        if (!res) throw new NotFoundException('Resource not found');
        return res;
    }
}
