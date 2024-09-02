const MAX_TAG_LENGTH = 20   // Max length for TAG type

function startsWithHttp(url) {
    return url.toLowerCase().startsWith('http://') || url.toLowerCase().startsWith('https://');
}

function isBoolean(value) {
    return typeof value === 'boolean';
}

function generateFTCreateCommand(indexName, indexType, indexPrefix, obj) {
    let schema = `FT.CREATE ${indexName} ON ${indexType} PREFIX ${indexPrefix.length} `;

    for (let i=0; i < indexPrefix.length; i++)
        schema += `${indexPrefix[i]} `
    schema += 'SCHEMA '

    for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
            let fieldType;

            // Determine the field type based on the data type of the property value
            if  (isBoolean(obj[key]))
                fieldType = 'TAG SORTABLE'                    
            else if (typeof obj[key] === 'number') {
                fieldType = 'NUMERIC SORTABLE';
            } else if (typeof obj[key] === 'string') {
                if (startsWithHttp(obj[key])) 
                    fieldType = 'NOINDEX';    
                else if (obj[key].length <= MAX_TAG_LENGTH)
                    fieldType = 'TAG SORTABLE';
                else 
                    fieldType = 'TEXT WEIGHT 1.0 SORTABLE';
            } else if (Array.isArray(obj[key])) {
                fieldType = 'TAG SORTABLE SEPARATOR ";"';
            } else {
                // Handle other data types as needed
                console.log('obj[key])=', obj[key])
                fieldType = 'NOINDEX'; // Default to NOINDEX
            }

            schema += (indexType==='HASH' ? '': '$.' ) +`${key} ${fieldType} `;
        }
    }

    return schema;
}

// Sample JavaScript object
// const sampleObject = {
//     id: 123,
//     title: 'Sample Title very long title',
//     content: 'Sample Content very long content',
//     author: 'John Doe',
//     tags: ['science', 'business'], 
//     genre: "fiction"
// };

// Generate the FT.CREATE command based on the sample object
// const indexName = 'books-idx';
// const indexType = 'HASH'; 
// const indexPrefix = ['ru203:book:details:']

// const ftCreateCommand = generateFTCreateCommand(indexName, 
//                                                 indexType, 
//                                                 indexPrefix, 
//                                                 sampleObject);

//console.log(ftCreateCommand);

/*
FT.CREATE books-idx ON HASH PREFIX 1 ru203:book:details: SCHEMA isbn TAG SORTABLE title TEXT WEIGHT 2.0 SORTABLE subtitle TEXT SORTABLE thumbnail TAG NOINDEX description TEXT SORTABLE published_year NUMERIC SORTABLE average_rating NUMERIC SORTABLE authors TEXT SORTABLE categories TAG SEPARATOR ";" author_ids TAG SEPARATOR ";"

FT.CREATE users-idx ON HASH PREFIX 1 ru203:user:details: SCHEMA first_name TEXT SORTABLE last_name TEXT SORTABLE email TAG SORTABLE escaped_email TEXT NOSTEM SORTABLE user_id TAG SORTABLE last_login NUMERIC SORTABLE

FT.CREATE authors-idx ON HASH PREFIX 1 ru203:author:details: SCHEMA name TEXT SORTABLE author_id TAG SORTABLE

FT.CREATE authors-books-idx ON HASH PREFIX 1 ru203:author:books: SCHEMA book_isbn TAG SORTABLE author_id TAG SORTABLE

FT.CREATE checkouts-idx ON HASH PREFIX 1 ru203:book:checkout: SCHEMA user_id TAG SORTABLE book_isbn TAG SORTABLE checkout_date NUMERIC SORTABLE return_date NUMERIC SORTABLE checkout_period_days NUMERIC SORTABLE geopoint GEO

*/