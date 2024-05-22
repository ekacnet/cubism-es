describe('Stock Check Test', function () {
  it('Checks for 19 div elements with class horizon', function () {
    // Navigate to the stock check page
    cy.visit('http://localhost:3004/stock.html');

    // Check if there are 19 div elements with the class 'horizon'
    cy.get('div.horizon').should('have.length', 19);

    // Check if the first div of class 'horizon' contains a span of class 'value' with the text '+590%'
    cy.get('div.horizon').first().find('span.value').should('contain', '+590%');
    // Get the canvas within the first div of class 'horizon'
    cy.get('div.horizon')
      .first()
      .find('canvas')
      .then(($canvas) => {
        // Get the canvas context
        const context = $canvas[0].getContext('2d');

        // Get the color of the pixel 5px down from the top
        const pixelData = context.getImageData(698, 5, 1, 1).data;

        // Convert the color data to a CSS color
        const color = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;

        // Assert that the color is what you expect
        expect(color).to.equal('rgb(186, 228, 179)'); // replace with the expected color
      });
  });
});

describe('Random Check Test', function () {
  it('Checks for 49 div elements with class horizon', function () {
    // Navigate to the stock check page
    cy.visit('http://localhost:3004/random1s.html');

    // Check if there are 49 div elements with the class 'horizon'
    cy.get('div.horizon').should('have.length', 49);

    // Move the mouse pointer 698px to the right of the first div of class 'horizon'
    cy.get('div.horizon')
      .first()
      .then(($div) => {
        const divOffset = $div.offset();
        cy.get('body').trigger(
          'mousemove',
          divOffset.left + 698,
          divOffset.top
        );
      });
    // Check if the div with the id 'rule' has a style attribute with the value 'left: 698px'
    cy.get('#rule')
      .find('div.line')
      .should('have.attr', 'style')
      .and('include', 'left: 698px');
    cy.get('#rule').find('div.line').should('be.visible');
  });
});
describe('Random Check Rule Test', function () {
  it('Checks for 49 div elements with class horizon', function () {
    // Navigate to the stock check page
    cy.visit('http://localhost:3004/random1s.html');

    // Check if there are 49 div elements with the class 'horizon'
    cy.get('div.horizon').should('have.length', 49);

    // Move the mouse pointer 698px to the right of the first div of class 'horizon'
    cy.get('div.horizon')
      .first()
      .then(($div) => {
        const divOffset = $div.offset();
        cy.get('body').trigger(
          'mousemove',
          divOffset.left + 698,
          divOffset.top
        );
      });
    // We asked the framework to draw a line in the middle let's check it's here
    cy.get('#rule')
      .find('div.metric')
      .should('have.attr', 'style')
      .and('include', 'left: 640px');
    cy.get('#rule').find('div.metric').should('be.visible');
  });
});
describe('Random Check Test with Wait', function () {
  context('1080p resolution', () => {
    beforeEach(() => {
      // run these tests as if in a desktop
      // browser with a 720p monitor
      cy.viewport(1920, 1080);
    });
    it('Checks for that the rule disapear if we move the mouse out', function () {
      // Navigate to the stock check page
      cy.visit('http://localhost:3004/random.html');

      // Check if there are 49 div elements with the class 'horizon'
      cy.get('div.horizon').should('have.length', 49);

      // Move the mouse pointer 698px to the right of the first div of class 'horizon'
      // note: when we reference ourselves of the div.horizon we just need to move 697 px right
      let value = '0';
      let valuebefore = '0';
      let mouseXPos = 697;
      cy.get('div.horizon')
        .first()
        .then(($div) => {
          cy.get('body').trigger('mousemove', mouseXPos, 0);
        });

      // Check if the div with the id 'rule' has a style attribute with the value 'left: 698px'
      cy.get('#rule')
        .find('div.line')
        .should('have.attr', 'style')
        .and('include', 'left: 698px');
      cy.get('#rule').find('div.line').should('be.visible');
      cy.get('body')
        .first()
        .then(($body) => {
          cy.get('body').trigger('mousemove', {
            eventConstructor: 'MouseEvent',
            clientX: 0,
            clientY: 0,
          });
        });
      cy.get('body')
        .first()
        .then(($body) => {
          cy.get('body').trigger('mouseout', {
            eventConstructor: 'MouseEvent',
            clientX: 0,
            clientY: 0,
          });
        });
      cy.get('#rule')
        .find('div.line')
        .should('have.attr', 'style')
        .and('include', 'display: none');
    });
    it('Checks for 49 div elements with class horizon', function () {
      // Navigate to the stock check page
      cy.visit('http://localhost:3004/random1s.html');

      // Check if there are 49 div elements with the class 'horizon'
      cy.get('div.horizon').should('have.length', 49);

      // Move the mouse pointer 698px to the right of the first div of class 'horizon'
      // note: when we reference ourselves of the div.horizon we just need to move 697 px right
      let value = '0';
      let valuebefore = '0';
      cy.get('div.horizon')
        .first()
        .then(($div) => {
          cy.get('body').trigger('mousemove', mouseXPos, 0);
        });

      let mouseXPos = 697;
      // Check if the div with the id 'rule' has a style attribute with the value 'left: 698px'
      cy.get('#rule')
        .find('div.line')
        .should('have.attr', 'style')
        .and('include', 'left: 698px');
      cy.get('#rule').find('div.line').should('be.visible');

      // let's get the current value, note: we need to use a closure to set the value
      cy.get('div.axis')
        .first()
        .get('text')
        .first()
        .invoke('text')
        .then(($span) => {
          value = $span;
          cy.log(value);
        });

      // seems like cy.clock() + cy.tick() is not really doing the trick so let time go by
      const waitAndCheck = (waited) => {
        cy.wait(waited);
        cy.log('waited ' + waited / 1000 + ' seconds');

        // Let's recheck our div, the value should have shifted left of waited / 1000 px, so let's
        // move the ruler first
        cy.get('div.horizon')
          .first()
          .then(($div) => {
            mouseXPos -= Math.floor(waited / 1000);
            cy.get('body').trigger('mousemove', mouseXPos, 0);
          });
        // and get the value
        cy.get('div.axis')
          .first()
          .then(($div) => {
            const text = $div.find('text:first').text();
            cy.log(
              'previous value is ' + value + ' and current value is ' + text
            );
            // we have to be inside a closure to compare against a variable otherwise it seems that
            // cypress is evaluating the variable value right away not when it is executing the
            // instruction
            let previous = value.split(':');
            let current = text.split(':');
            expect(previous[0]).equal(current[0]);
            if (previous[1] == current[1]) {
              expect(previous[1]).equal(current[1]);
            } else {
              cy.log('There is a shift by one, this can happen');
              expect(+previous[1]).equal(+current[1] - 1);
            }
          });
      };
      waitAndCheck(3500);
      waitAndCheck(5500);
    });
  });
});
describe('Stock Check Test With Mouse', function () {
  it('Checks for 19 div elements with class horizon', function () {
    // Navigate to the stock check page
    cy.visit('http://localhost:3004/stock.html');

    // Check if the first div of class 'horizon' contains a span of class 'value' with the text '+590%'
    cy.get('div.horizon').first().find('span.value').should('contain', '+590%');

    // Move the mouse pointer 698px to the right of the first div of class 'horizon'
    cy.get('div.horizon')
      .first()
      .then(($div) => {
        const divOffset = $div.offset();
        cy.get('body').trigger(
          'mousemove',
          divOffset.left + 698,
          divOffset.top
        );
      });
    cy.get('div.horizon').first().find('span.value').should('contain', '+240%');

    // Get the canvas within the first div of class 'horizon'
    cy.get('div.horizon')
      .first()
      .find('canvas')
      .then(($canvas) => {
        // Get the canvas context
        const context = $canvas[0].getContext('2d');

        // Get the color of the pixel 5px down from the top
        const pixelData = context.getImageData(698, 5, 1, 1).data;

        // Convert the color data to a CSS color
        const color = `rgb(${pixelData[0]}, ${pixelData[1]}, ${pixelData[2]})`;

        // Assert that the color is what you expect
        expect(color).to.equal('rgb(186, 228, 179)'); // replace with the expected color
      });
    // Check if the div with the id 'rule' has a style attribute with the value 'left: 698px'
    cy.get('#rule')
      .find('div.line')
      .should('have.attr', 'style')
      .and('include', 'left: 698px');
  });
});
describe('Stock Check Test With Zoom', function () {
  it('Checks for 19 div elements with class horizon', function () {
    // Navigate to the stock check page
    cy.visit('http://localhost:3004/stock.html');

    // Check if the first div of class 'horizon' contains a span of class 'value' with the text '+590%'
    cy.get('div.horizon').first().find('span.value').should('contain', '+590%');

    // simulate a mouse click see
    // https://stackoverflow.com/questions/55303476/cypress-trigger-commands-with-mousedown-mousemove-mouseup-do-not-work
    // for more details on why we need a more complicated synthax
    cy.get('div.horizon')
      .first()
      .then(($div) => {
        cy.get('body').trigger('mousemove', 10, 70);
        cy.get('body').trigger('mousedown', {
          eventConstructor: 'MouseEvent',
          button: 0,
          clientX: 10,
          clientY: 70,
        });
        cy.wait(200);
        cy.get('body').trigger('mousemove', {
          eventConstructor: 'MouseEvent',
          clientX: 300,
          clientY: 80,
        });
        cy.wait(200);
        cy.get('body').trigger('mouseup', {
          eventConstructor: 'MouseEvent',
          clientX: 300,
          clientY: 80,
        });
        // Deal with the delay in rendering after zooming
        cy.wait(600);
        // Check if there are 19 div elements with the class 'horizon'
        cy.get('div.horizon').should('have.length', 19);
        // Check if the div with the id 'rule' has a style attribute with the value 'left: 698px'
        cy.get('div.horizon')
          .first()
          .then(($div) => {
            const divOffset = $div.offset();
            cy.get('body').trigger('mousemove', 10, 70);
          });
        cy.get('#rule')
          .find('div.line')
          .should('have.attr', 'style')
          .and('include', 'left: 10px');
      });
  });
});
describe('Key press Test', function () {
  it('Checks for 49 div elements with class horizon', function () {
    // Navigate to the stock check page
    cy.visit('http://localhost:3004/random1s.html');

    // Check if there are 49 div elements with the class 'horizon'
    cy.get('div.horizon').should('have.length', 49);

    // Move the mouse pointer 698px to the right of the first div of class 'horizon'
    cy.get('div.horizon')
      .first()
      .then(($div) => {
        const divOffset = $div.offset();
        cy.get('body').trigger(
          'mousemove',
          divOffset.left + 698,
          divOffset.top
        );
      });
    cy.get('div.horizon')
      .first()
      .then(($div) => {
        const divOffset = $div.offset();
        cy.get('body').trigger('keydown', { keyCode: 37, force: true });
        cy.wait(200);
        cy.get('body').trigger('keyup', { keyCode: 37, force: true });
      });
    cy.wait(200);
    cy.get('div.horizon')
      .first()
      .then(($div) => {
        const divOffset = $div.offset();
        cy.get('body').trigger('keydown', { keyCode: 39, force: true });
        cy.wait(200);
        cy.get('body').trigger('keyup', { keyCode: 39, force: true });
      });
    cy.wait(200);
    cy.get('div.horizon')
      .first()
      .then(($div) => {
        const divOffset = $div.offset();
        cy.get('body').trigger('keydown', { keyCode: 38, force: true });
        cy.wait(200);
        cy.get('body').trigger('keyup', { keyCode: 38, force: true });
      });
    // TODO check things better
  });
});
