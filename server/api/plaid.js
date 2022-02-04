const { Router } = require('express');
const router = Router();
const plaid = require('plaid');

const plaidClient = new plaid.Client({
  clientID: process.env.PLAID_CLIENT_ID,
  secret: process.env.PLAID_SECRET,
  env: plaid.environments.sandbox,
});

router.post('/create_link_token', async (req, res, next) => {
  try {
    const { id, firstName, lastName, email } = req?.body;
    console.log(req.body, 'defined');
    const response = await plaidClient.createLinkToken({
      user: {
        client_user_id: `user${id}` || 'userId',
        legal_name: `${firstName} ${lastName}` || 'User Name',
        email_address: `${email}` || 'email@test.com',
      },
      client_name: 'FUNDIT',
      products: ['auth', 'transactions', 'identity'],
      country_codes: ['US'],
      language: 'en',
      account_filters: {
        depository: {
          account_subtypes: ['checking', 'savings'],
        },
      },
    });
    res.status(201).send(response.link_token);
  } catch (err) {
    next(err);
  }
});

//exhanges plaid's public token for access token and access token for stripe bank account token
router.post('/tokenExchange', async (req, res) => {
  const { token, accountId } = req.body;
  const { access_token: accessToken } = await plaidClient.exchangePublicToken(
    token
  );
  const stripeToken = await plaidClient.createStripeToken(
    accessToken,
    accountId
  );

  //stripe res token - stripe.stripe_bank_account_token
  console.log('stripe', stripeToken);
  console.log('accessToken', accessToken);

  // const authResponse = await plaidClient.getAuth(accessToken);
  // console.log('Auth response:', authResponse);
  // console.log('---------------');

  // const identityResponse = await plaidClient.getIdentity(accessToken);
  // console.log('Identity response:', identityResponse);
  // console.log('---------------');

  // const balanceResponse = await plaidClient.getBalance(accessToken);
  // console.log('Balance response', balanceResponse);
  // console.log('---------------');

  res.status(200).send(stripeToken);
});

module.exports = router;
