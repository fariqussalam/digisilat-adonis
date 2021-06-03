'use strict'

class FileController {

    async download({request, response}) {
        const { filename } = request.only(['filename'])
        if (filename) {
            return response.attachment(filename)
        }
    }
}

module.exports = FileController
