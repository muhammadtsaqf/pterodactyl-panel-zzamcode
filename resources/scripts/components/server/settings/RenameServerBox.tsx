import React from 'react';
import { ServerContext } from '@/state/server';
import { Field as FormikField, Form, Formik, FormikHelpers, useFormikContext } from 'formik';
import { Actions, useStoreActions } from 'easy-peasy';
import renameServer from '@/api/server/renameServer';
import Field from '@/components/elements/Field';
import { object, string } from 'yup';
import SpinnerOverlay from '@/components/elements/SpinnerOverlay';
import { ApplicationStore } from '@/state';
import { httpErrorToHuman } from '@/api/http';
import { Button } from '@/components/elements/button/index';
import tw from 'twin.macro';
import Label from '@/components/elements/Label';
import FormikFieldWrapper from '@/components/elements/FormikFieldWrapper';
import { Textarea } from '@/components/elements/Input';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave } from '@fortawesome/free-solid-svg-icons';

interface Values {
    name: string;
    description: string;
}

const RenameServerBox = () => {
    const { isSubmitting } = useFormikContext<Values>();

    return (
        <div css={tw`relative`}>
            <SpinnerOverlay visible={isSubmitting} />
            <Form css={tw`mb-0 space-y-6`}>
                <Field id={'name'} name={'name'} label={'Server Name'} type={'text'} />
                <div>
                    <Label css={tw`text-xs text-neutral-400 uppercase tracking-wider mb-2 block`}>Server Description</Label>
                    <FormikFieldWrapper name={'description'}>
                        <FormikField as={Textarea} name={'description'} rows={3} css={tw`bg-neutral-900/50 border-neutral-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500`} />
                    </FormikFieldWrapper>
                </div>
                <div css={tw`flex justify-end pt-2`}>
                    <Button type={'submit'} css={tw`bg-blue-600 hover:bg-blue-500 text-white border-none shadow-lg transition-all duration-200`}>
                        <FontAwesomeIcon icon={faSave} css={tw`mr-2`} />
                        Save Changes
                    </Button>
                </div>
            </Form>
        </div>
    );
};

export default () => {
    const server = ServerContext.useStoreState((state) => state.server.data!);
    const setServer = ServerContext.useStoreActions((actions) => actions.server.setServer);
    const { addError, clearFlashes } = useStoreActions((actions: Actions<ApplicationStore>) => actions.flashes);

    const submit = ({ name, description }: Values, { setSubmitting }: FormikHelpers<Values>) => {
        clearFlashes('settings');
        renameServer(server.uuid, name, description)
            .then(() => setServer({ ...server, name, description }))
            .catch((error) => {
                console.error(error);
                addError({ key: 'settings', message: httpErrorToHuman(error) });
            })
            .then(() => setSubmitting(false));
    };

    return (
        <Formik
            onSubmit={submit}
            initialValues={{
                name: server.name,
                description: server.description,
            }}
            validationSchema={object().shape({
                name: string().required().min(1),
                description: string().nullable(),
            })}
        >
            <RenameServerBox />
        </Formik>
    );
};
