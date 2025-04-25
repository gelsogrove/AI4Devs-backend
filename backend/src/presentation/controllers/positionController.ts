import { Request, Response } from 'express';
import { getCandidatesByPositionId } from '../../application/services/positionService';

export const getPositionCandidates = async (req: Request, res: Response) => {
    try {
        const positionId = parseInt(req.params.id);
        
        if (isNaN(positionId)) {
            return res.status(400).json({ error: 'Invalid position ID format' });
        }
        
        // Parse query parameters
        const options = {
            sort: req.query.sort as 'name' | 'score' | 'stage' || 'name',
            order: req.query.order as 'asc' | 'desc' || 'asc',
            page: req.query.page ? parseInt(req.query.page as string) : 1,
            limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
            stage: req.query.stage as string || undefined,
            minScore: req.query.minScore ? parseFloat(req.query.minScore as string) : undefined
        };
        
        // Validate pagination parameters
        if (isNaN(options.page) || options.page < 1) {
            return res.status(400).json({ error: 'Invalid page number' });
        }
        
        if (isNaN(options.limit as number) || options.limit < 1 || options.limit > 100) {
            return res.status(400).json({ error: 'Invalid limit value. Must be between 1 and 100' });
        }
        
        // Validate sort order
        if (options.order && !['asc', 'desc'].includes(options.order)) {
            return res.status(400).json({ error: 'Invalid order value. Must be "asc" or "desc"' });
        }
        
        // Validate sort field
        if (options.sort && !['name', 'score', 'stage'].includes(options.sort)) {
            return res.status(400).json({ error: 'Invalid sort field. Must be "name", "score", or "stage"' });
        }
        
        // Validate minScore if provided
        if (options.minScore !== undefined && (isNaN(options.minScore) || options.minScore < 0 || options.minScore > 10)) {
            return res.status(400).json({ error: 'Invalid minScore value. Must be between 0 and 10' });
        }
        
        const result = await getCandidatesByPositionId(positionId, options);
        res.json(result);
    } catch (error) {
        console.error('Error fetching position candidates:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}; 