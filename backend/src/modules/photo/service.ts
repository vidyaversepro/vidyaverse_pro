// Stub service - real logic lives in the plural-named module
export const service = {
    async findAll() {
        return [];
    },
    async findById(_id: string) {
        return null;
    },
    async create(_data: any) {
        return null;
    },
    async update(_id: string, _data: any) {
        return null;
    },
    async delete(_id: string) {
        return;
    }
};
