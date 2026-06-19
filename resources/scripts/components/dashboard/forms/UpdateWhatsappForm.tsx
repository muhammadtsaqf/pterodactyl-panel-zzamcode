import React from 'react';
import { Actions, State, useStoreActions, useStoreState } from 'easy-peasy';
import { Form, Formik, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import Field from '@/components/elements/Field';
import { httpErrorToHuman } from '@/api/http';
import { ApplicationStore } from '@/state';
import tw from 'twin.macro';
import { Button } from '@/components/elements/button/index';
import http from '@/api/http';

interface Values {
    whatsapp_number: string;
}

const schema = Yup.object().shape({
    whatsapp_number: Yup.string()
        .matches(/^[0-9]+$/, 'WhatsApp number must only contain digits.')
        .min(10, 'WhatsApp number is too short.')
        .max(15, 'WhatsApp number is too long.'),
});

export default () => {
    const user = useStoreState((state: State<ApplicationStore>) => state.user.data);
    const updateUserData = useStoreActions((state: Actions<ApplicationStore>) => state.user.updateUserData);
    const { clearFlashes, addFlash } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const submit = (values: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('account:whatsapp');

        http.put('/api/client/account/whatsapp', values)
            .then(() => {
                updateUserData({ whatsappNumber: values.whatsapp_number });
                addFlash({
                    type: 'success',
                    key: 'account:whatsapp',
                    message: 'Your WhatsApp number has been successfully saved.',
                });
            })
            .catch((error) =>
                addFlash({
                    type: 'error',
                    key: 'account:whatsapp',
                    title: 'Error',
                    message: httpErrorToHuman(error),
                })
            )
            .then(() => {
                setSubmitting(false);
            });
    };

    return (
        <Formik onSubmit={submit} validationSchema={schema} initialValues={{ whatsapp_number: user?.whatsappNumber || '' }}>
            {({ isSubmitting, isValid, dirty }) => (
                <React.Fragment>
                    <SpinnerOverlay size={'large'} visible={isSubmitting} />
                    <Form css={tw`m-0`}>
                        <Field
                            id={'whatsapp_number'}
                            type={'text'}
                            name={'whatsapp_number'}
                            label={'WhatsApp Number'}
                            description={'Enter your WhatsApp number including the country code without any + sign. Example: 6281234567890'}
                        />
                        <div css={tw`mt-6`}>
                            <Button disabled={isSubmitting || !isValid || !dirty}>Update WhatsApp Number</Button>
                        </div>
                    </Form>
                </React.Fragment>
            )}
        </Formik>
    );
};
