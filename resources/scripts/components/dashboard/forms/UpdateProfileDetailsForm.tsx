import React, { useState } from 'react';
import { useStoreState, useStoreActions, Actions } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import updateProfileDetails from '@/api/account/updateProfileDetails';
import useFlash from '@/plugins/useFlash';
import Button from '@/components/elements/Button';
import Input from '@/components/elements/Input';
import Label from '@/components/elements/Label';
import tw from 'twin.macro';
import styled from 'styled-components/macro';

const FormGroup = styled.div`
    ${tw`mb-4`};
`;

const FlexGrid = styled.div`
    ${tw`grid grid-cols-1 md:grid-cols-2 gap-4`};
`;

export default () => {
    const { addFlash, clearFlashes } = useFlash();
    const user = useStoreState((state: ApplicationStore) => state.user.data!);
    const updateUserData = useStoreActions((actions: Actions<ApplicationStore>) => actions.user.updateUserData);

    const [isSubmit, setSubmit] = useState(false);
    
    // Form state
    const [firstName, setFirstName] = useState(user.firstName || '');
    const [lastName, setLastName] = useState(user.lastName || '');
    const [phone, setPhone] = useState(user.phone || '');
    const [company, setCompany] = useState(user.company || '');
    const [address1, setAddress1] = useState(user.address1 || '');
    const [address2, setAddress2] = useState(user.address2 || '');
    const [city, setCity] = useState(user.city || '');
    const [stateRegion, setStateRegion] = useState(user.state || '');
    const [zip, setZip] = useState(user.zip || '');
    const [country, setCountry] = useState(user.country || '');

    const submit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSubmit(true);
        clearFlashes('account:profile');

        const payload = {
            name_first: firstName,
            name_last: lastName,
            phone,
            company,
            address_1: address1,
            address_2: address2,
            city,
            state: stateRegion,
            zip,
            country,
        };

        updateProfileDetails(payload)
            .then(() => {
                updateUserData({
                    firstName,
                    lastName,
                    phone,
                    company,
                    address1,
                    address2,
                    city,
                    state: stateRegion,
                    zip,
                    country,
                });
                addFlash({
                    key: 'account:profile',
                    type: 'success',
                    message: 'Your profile has been updated successfully.',
                });
            })
            .catch((error) => {
                console.error(error);
                addFlash({
                    key: 'account:profile',
                    type: 'error',
                    message: error.response?.data?.error || 'An error occurred while saving your profile.',
                });
            })
            .finally(() => {
                setSubmit(false);
            });
    };

    return (
        <form onSubmit={submit}>
            <FlexGrid>
                <FormGroup>
                    <Label>First Name</Label>
                    <Input value={firstName} onChange={e => setFirstName(e.target.value)} required />
                </FormGroup>
                <FormGroup>
                    <Label>Last Name</Label>
                    <Input value={lastName} onChange={e => setLastName(e.target.value)} required />
                </FormGroup>
            </FlexGrid>
            
            <FlexGrid>
                <FormGroup>
                    <Label>Phone Number</Label>
                    <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="+1234567890" />
                </FormGroup>
                <FormGroup>
                    <Label>Company</Label>
                    <Input value={company} onChange={e => setCompany(e.target.value)} />
                </FormGroup>
            </FlexGrid>

            <FormGroup>
                <Label>Address 1</Label>
                <Input value={address1} onChange={e => setAddress1(e.target.value)} />
            </FormGroup>
            
            <FormGroup>
                <Label>Address 2</Label>
                <Input value={address2} onChange={e => setAddress2(e.target.value)} />
            </FormGroup>

            <FlexGrid>
                <FormGroup>
                    <Label>City</Label>
                    <Input value={city} onChange={e => setCity(e.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Label>State / Region</Label>
                    <Input value={stateRegion} onChange={e => setStateRegion(e.target.value)} />
                </FormGroup>
            </FlexGrid>

            <FlexGrid>
                <FormGroup>
                    <Label>Zip Code</Label>
                    <Input value={zip} onChange={e => setZip(e.target.value)} />
                </FormGroup>
                <FormGroup>
                    <Label>Country</Label>
                    <Input value={country} onChange={e => setCountry(e.target.value)} />
                </FormGroup>
            </FlexGrid>

            <div css={tw`mt-6 text-right`}>
                <Button type="submit" size="large" disabled={isSubmit}>
                    Save Changes
                </Button>
            </div>
        </form>
    );
};
