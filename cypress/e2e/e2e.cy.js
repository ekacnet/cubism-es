describe('Stock Check Test', function() {
    it('Checks for 19 div elements with class horizon', function() {

        // Navigate to the stock check page
        cy.visit('http://localhost:3004/stock.html')

        // Check if there are 19 div elements with the class 'horizon'
        cy.get('div.horizon').should('have.length', 19)

        // Check if the first div of class 'horizon' contains a span of class 'value' with the text '+590%'
        cy.get('div.horizon').first().find('span.value').should('contain', '+590%')
        // Get the canvas within the first div of class 'horizon'
        cy.get('div.horizon').first().find('canvas').then(($canvas) => {
            // Get the canvas context
            const context = $canvas[0].getContext('2d');

            // Get the color of the pixel 5px down from the top
            const pixelData = context.getImageData(698, 5, 1, 1).data;

            // Convert the color data to a CSS color
            const color = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;

            // Assert that the color is what you expect 
            expect(color).to.equal('rgb(186, 228, 179)'); // replace with the expected color
        })
    })
})
describe('Stock Check Test With Mouse', function() {
    it('Checks for 19 div elements with class horizon', function() {

        // Navigate to the stock check page
        cy.visit('http://localhost:3004/stock.html')

        // Check if the first div of class 'horizon' contains a span of class 'value' with the text '+590%'
        cy.get('div.horizon').first().find('span.value').should('contain', '+590%')

        // Move the mouse pointer 698px to the right of the first div of class 'horizon'
        cy.get('div.horizon').first().then(($div) => {
            const divOffset = $div.offset();
            cy.get('body').trigger('mousemove', divOffset.left + 698, divOffset.top);
        })
        cy.get('div.horizon').first().find('span.value').should('contain', '+240%')

        // Get the canvas within the first div of class 'horizon'
        cy.get('div.horizon').first().find('canvas').then(($canvas) => {
            // Get the canvas context
            const context = $canvas[0].getContext('2d');

            // Get the color of the pixel 5px down from the top
            const pixelData = context.getImageData(698, 5, 1, 1).data;

            // Convert the color data to a CSS color
            const color = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;

            // Assert that the color is what you expect 
            expect(color).to.equal('rgb(186, 228, 179)'); // replace with the expected color
        })
        // Check if the div with the id 'rule' has a style attribute with the value 'left: 698px'
        cy.get('#rule').find('div.line').should('have.attr', 'style').and('include', 'left: 698px');
    })
})
