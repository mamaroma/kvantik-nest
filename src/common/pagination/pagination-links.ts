import { Request, Response } from 'express';

export function setPaginationLinks(req: Request, res: Response, page: number, limit: number, totalItems: number) {
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    const links: string[] = [];

    const buildUrl = (targetPage: number) => {
        const query = new URLSearchParams();

        for (const [key, value] of Object.entries(req.query ?? {})) {
            if (value === undefined || value === null || key === 'page' || key === 'limit') {
                continue;
            }

            if (Array.isArray(value)) {
                for (const item of value) {
                    query.append(key, String(item));
                }
            } else {
                query.set(key, String(value));
            }
        }

        query.set('page', String(targetPage));
        query.set('limit', String(limit));

        return `${req.protocol}://${req.get('host')}${req.path}?${query.toString()}`;
    };

    if (page > 1) {
        links.push(`<${buildUrl(page - 1)}>; rel=\"prev\"`);
    }

    if (page < totalPages) {
        links.push(`<${buildUrl(page + 1)}>; rel=\"next\"`);
    }

    if (links.length > 0) {
        res.setHeader('Link', links.join(', '));
    }

    res.setHeader('X-Total-Count', String(totalItems));
}
