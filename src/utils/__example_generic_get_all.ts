// Controller function for getting all TaxiTypes with dynamic filtering, attribute selection, and dynamic search
export const getAllTaxiTypes = async (req: Request, res: Response): Promise<void> => {
    try {
      // Dynamic filtering: construct filter object from query parameters
      const filter: Record<string, any> = {};
  
      for (const key in req.query) {
        if (Object.prototype.hasOwnProperty.call(req.query, key)) {
          filter[key] = req.query[key];
        }
      }
  
      // Search query
      const searchQuery: Record<string, any> = {};
      const searchString = req.query.search as string;
  
      if (searchString) {
        // Get the schema paths
        const schemaPaths = TaxiType.schema.paths;
  
        // Iterate over the schema paths
        for (const path in schemaPaths) {
          const pathType = schemaPaths[path].instance;
          if (pathType === 'String') {
            searchQuery[path] = { $regex: searchString, $options: 'i' }; // Case-insensitive search
          }
        }
      }
  
      // Merge the search query with the existing filter
      Object.assign(filter, searchQuery);
  
      // Fetch TaxiTypes from the database based on dynamic filtering and search
      const taxiTypes = await TaxiType.find(filter);
  
      // Select only specified attributes if they are provided in the query
      const selectedAttributes = typeof req.query.attributes === 'string'
        ? req.query.attributes.split(',')
        : null;
  
      const formattedTaxiTypes = taxiTypes.map((taxiType) => {
        if (selectedAttributes) {
          const selectedTaxiType: Record<string, any> = {};
          selectedAttributes.forEach((attribute) => {
            selectedTaxiType[attribute] = (taxiType as any)[attribute]; // Type assertion here
          });
          return selectedTaxiType;
        } else {
          return taxiType.toObject(); // Use toObject() to convert Mongoose document to a plain JavaScript object
        }
      });
  
      // Send the formatted TaxiTypes in the response
      res.status(200).json({ taxiTypes: formattedTaxiTypes });
    } catch (error) {
      // Handle errors and send an error response
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  };
  